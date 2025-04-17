# EncoreChain - An NFT Ticket Booking Platform

## Prerequisites
Before cloning and installing the project, ensure the following are installed globally on the system:

### 🔧 Tools to Install Globally

| Tool | Version | Purpose |
| ---- | ------- | ------- |
| Node.js | 18+ | Required for React/Next.js development |
| npm | 9+ | Node Packet manager to install dependencies |
| Metamask (browser extension) | Latest |	For wallet connection |
| Git |	Any |	To clone the repo |

### Project Setup and Run Instructions

1. Clone the github repository into your local.
2. Navigate to the nft-ticket-system directory.
3. Install the dependencies using the command `npm install`.
4. Run the command `npm run build` to compile the application.
5. Start running the application using `npm start`, which will deploy the app in the localhost port 3000.
6. Access the application via `http://localhost:3000`

### Application Workflow

![Architect-updated](https://github.com/user-attachments/assets/47b91122-54c8-41a8-ad47-6519f590a0db)

#### 1. Purchasing NFT Tickets (Primary Market)

User Flow:
 - The user visits the home page where the available events are rendered by the frontend.
 - The user selects an event and the event page is loaded.
 - All the event data (name, date, venue, seat categories, price range) is fetched from the smart contract functions via ethers.js.
 - The user selects Seat type (e.g.,VIP, General) and Quantity (1-10) of the tickets to be purchased.
 - On clicking “Purchase tickets”, the frontend calls the smart contract’s purchaseTickets() function and sends: eventId, seatType, quantity and tokenURI (for the respective event).
 - Along with the required ETH (msg.value), once the user confirms the transaction.

![pic1](https://github.com/user-attachments/assets/7412fd3b-d08f-4c65-85e1-94cbf4d719f5)

#### 2. Listing for Resale

User Flow:
 - In the "My Tickets" section, each unused ticket has a resale price input, and a "List for Resale" button.
 - Upon user submission, the frontend calls the listForResale(ticketId, price) function.
 - The price listing for a resale ticket shouldn't be exceeding 20% above the original price (anti-scalping control). 

![pic2](https://github.com/user-attachments/assets/6091ad5d-7890-45dd-9fe7-cb12f7b31b70)

#### 3. Buying from the Secondary Market

User Flow:
- In the "Secondary Market" section, all listed tickets(listed for resale) are fetched by looping through all token IDs for each event and checking for each ticket:
- If resalePrice(ticketId) > 0, to ensure it is a resale ticket.
- Displays event info, seat type, price, and a "Buy Ticket" button enabling the users to purchase the ticket from the secondary market.

![pic3](https://github.com/user-attachments/assets/b98f7e26-bcf7-4dbb-91ce-d4729207d14f)
