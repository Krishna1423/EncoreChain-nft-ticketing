// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTTicket is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketIds;

    struct SeatCategory {
        uint96 price;
        uint96 totalSeats;
        uint96 soldSeats;
    }

    struct Event {
        string name;
        string date;
        string venue;
        address organizer;
        uint96 totalSeats;
        uint96 availableSeats;
        mapping(string => SeatCategory) seatCategories;
        bool isActive;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent;
    mapping(uint256 => string) public ticketToSeatType; 
    mapping(uint256 => bool) public isTicketUsed;
    mapping(uint256 => uint96) public resalePrice;
    mapping(uint256 => bool) public resold;

    uint256 private _eventIdCounter;

    constructor() ERC721("NFTTicket", "TICKET") Ownable(msg.sender) {
        // Create default Event 1
        {
            string[] memory seatTypes = new string[](2);
            seatTypes[0] = "VIP";
            seatTypes[1] = "General";

            uint96[] memory seatPrices = new uint96[](2);
            seatPrices[0] = 0.02 ether;
            seatPrices[1] = 0.01 ether;

            uint96[] memory seatCounts = new uint96[](2);
            seatCounts[0] = 300;
            seatCounts[1] = 800;

            _createEvent("Summer Music Festival", "2025-07-15", "Centennial Park, Toronto", seatTypes, seatPrices, seatCounts);
        }

        // Create default Event 2
        {
            string[] memory seatTypes = new string[](4);
            seatTypes[0] = "VIP";
            seatTypes[1] = "Front Row";
            seatTypes[2] = "Back Row";
            seatTypes[3] = "Floor";

            uint96[] memory seatPrices = new uint96[](4);
            seatPrices[0] = 0.1 ether;
            seatPrices[1] = 0.07 ether;
            seatPrices[2] = 0.05 ether;
            seatPrices[3] = 0.06 ether;

            uint96[] memory seatCounts = new uint96[](4);
            seatCounts[0] = 100;
            seatCounts[1] = 300;
            seatCounts[2] = 700;
            seatCounts[3] = 300;

            _createEvent("ColdPlay Concert", "2025-08-01", "Scotiabank Arena, Toronto", seatTypes, seatPrices, seatCounts);
        }
    }

    event EventCreated(uint256 eventId, string name, string date, string venue, address organizer);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer, string seatType, uint96 price);
    event TicketUsed(uint256 indexed ticketId, address indexed user);
    event TicketListedForResale(uint256 indexed ticketId, uint96 price);
    event TicketResold(uint256 indexed ticketId, address indexed newOwner, uint96 price);
    event TicketTransferred(uint256 indexed ticketId, address indexed from, address indexed to);

    function _createEvent(
        string memory name,
        string memory date,
        string memory venue,
        string[] memory seatTypes,
        uint96[] memory seatPrices,
        uint96[] memory seatCounts
    ) internal returns (uint256) {
        require(seatTypes.length == seatPrices.length && seatPrices.length == seatCounts.length, "Invalid seat data");

        uint256 eventId = _eventIdCounter;
        Event storage newEvent = events[eventId];
        newEvent.name = name;
        newEvent.date = date;
        newEvent.venue = venue;
        newEvent.organizer = msg.sender;

        uint96 totalSeats = 0;
        for (uint96 i = 0; i < seatTypes.length; i++) {
            newEvent.seatCategories[seatTypes[i]] = SeatCategory(seatPrices[i], seatCounts[i], 0);
            totalSeats += seatCounts[i];
        }

        newEvent.totalSeats = totalSeats;
        newEvent.availableSeats = totalSeats;
        newEvent.isActive = true;

        emit EventCreated(eventId, name, date, venue, msg.sender);
        _eventIdCounter++;

        return eventId;
    }

    function createEvent(
        string memory name,
        string memory date,
        string memory venue,
        string[] memory seatTypes,
        uint96[] memory seatPrices,
        uint96[] memory seatCounts
    ) external returns (uint256) {
        return _createEvent(name, date, venue, seatTypes, seatPrices, seatCounts);
    }

    function purchaseTickets(
        uint256 eventId,
        string memory seatType,
        string memory metadataURI,
        uint96 quantity
    ) external payable {
        require(events[eventId].isActive, "Event is not active");
        require(quantity > 0, "Quantity must be greater than zero");

        SeatCategory storage seat = events[eventId].seatCategories[seatType];
        require(seat.totalSeats >= seat.soldSeats + quantity, "Not enough seats available for this seat type");

        uint256 totalPrice = seat.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment for selected seat type");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 ticketId = _ticketIds.current();
            _safeMint(msg.sender, ticketId);
            _setTokenURI(ticketId, metadataURI);

            ticketToEvent[ticketId] = eventId;
            ticketToSeatType[ticketId] = seatType;

            emit TicketPurchased(ticketId, eventId, msg.sender, seatType, seat.price);
            _ticketIds.increment();
        }

        seat.soldSeats += quantity;
        events[eventId].availableSeats -= quantity;
    }

    function getEventCount() external view returns (uint256) {
        return _eventIdCounter;
    }

    function getEventDetails(uint256 eventId) external view returns (
        string memory name,
        string memory date,
        string memory venue,
        address organizer,
        uint96 totalSeats,
        uint96 availableSeats,
        bool isActive
    ) {
        Event storage ev = events[eventId];
        return (
            ev.name,
            ev.date,
            ev.venue,
            ev.organizer,
            ev.totalSeats,
            ev.availableSeats,
            ev.isActive
        );
    }

    function getSeatCategory(uint256 eventId, string memory seatType) external view returns (
        uint96 price,
        uint96 totalSeats,
        uint96 soldSeats
    ) {
        SeatCategory storage seat = events[eventId].seatCategories[seatType];
        return (
            seat.price,
            seat.totalSeats,
            seat.soldSeats
        );
    }

    function useTicket(uint256 ticketId) external {
        require(ownerOf(ticketId) == msg.sender, "You do not own this ticket");
        require(!isTicketUsed[ticketId], "Ticket already used");

        isTicketUsed[ticketId] = true;
        emit TicketUsed(ticketId, msg.sender);
    }

    function listForResale(uint256 ticketId, uint96 price) external {
        require(ownerOf(ticketId) == msg.sender, "You do not own this ticket");
        require(!isTicketUsed[ticketId], "Used tickets cannot be resold");
        require(!resold[ticketId], "Resold tickets cannot be listed again");

        uint256 eventId = ticketToEvent[ticketId];
        string memory seatType = ticketToSeatType[ticketId];
        uint256 seatPrice = events[eventId].seatCategories[seatType].price;

        require(price <= (seatPrice * 120) / 100, "Resale price exceeds 20% limit");

        resalePrice[ticketId] = price;
        emit TicketListedForResale(ticketId, price);
    }

    function buyResaleTicket(uint256 ticketId) external payable {
        require(resalePrice[ticketId] > 0, "Ticket is not for resale");
        require(msg.value >= resalePrice[ticketId], "Insufficient payment");

        address previousOwner = ownerOf(ticketId);
        _transfer(previousOwner, msg.sender, ticketId);
        payable(previousOwner).transfer(msg.value);

        resalePrice[ticketId] = 0;
        resold[ticketId] = true;

        emit TicketResold(ticketId, msg.sender, uint96(msg.value));
    }

    function transferTicket(uint256 ticketId, address to) external {
        require(ownerOf(ticketId) == msg.sender, "You do not own this ticket");
        require(!isTicketUsed[ticketId], "Used tickets cannot be transferred");

        _transfer(msg.sender, to, ticketId);
        emit TicketTransferred(ticketId, msg.sender, to);
    }

    // Required overrides for Solidity inheritance (ERC721 + URIStorage + Enumerable)

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value); 
    }

}