// 3. Transfer tokens to your WBA Address

// We're going to open up transfer.ts and import the following items from @solana/web3.js:
import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey, Signer } from "@solana/web3.js"
// We will also import our dev wallet as we did last time:
import wallet from "./dev-wallet.json"
// Import our dev wallet keypair from the wallet file
const fromKeyPair = Keypair.fromSecretKey(new Uint8Array(wallet));
// Define our WBA public key
const toPublicKey = new PublicKey("3tHnti46vNqKpa4Xtd6r1GtQrGZuApHZ6tTUDNPcLSwT");
//And create a devnet connection:
//Create a Solana devnet connection
const connection = new Connection("https://api.devnet.solana.com");
//Now we're going to create a transaction using @solana/web3.js to transfer 0.1 SOL from our
//dev wallet to our WBA wallet address on the Solana devenet.Here's how we do that:

// const transferOneTenthSol = async (fromKeyPair: Keypair, toPublicKey: PublicKey, connection: Connection) => {
//     try {
//         const transaction = new Transaction().add(
//             SystemProgram.transfer({
//                 fromPubkey: fromKeyPair.publicKey,
//                 toPubkey: toPublicKey,
//                 lamports: LAMPORTS_PER_SOL / 10,
//             })
//         );

//         transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
//         transaction.feePayer = fromKeyPair.publicKey;
//         // Sign transaction, broadcast, and confirm
//         const signature = await sendAndConfirmTransaction(
//             connection,
//             transaction,
//             [fromKeyPair as Signer]
//         );
//         console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
//     } catch (e) {
//         console.error(`Oops, something went wrong while trying to transfer 0.1 SOL: ${e}`)
//     }
// };

// transferOneTenthSol(fromKeyPair, toPublicKey, connection);



// 4. Empty devnet wallet into WBA wallet
// Get the exact balance of the account
// Calculate the fee of sending the transaction
// Calculate the exact number of lamports we can send whilst satisfying the fee rate

const emptyDevnetWalletIntoWbaWallet = async (fromKeyPair: Keypair, toPublicKey: PublicKey, connection: Connection) => {
    try {
        // Get balance of dev wallet
        const balance = await connection.getBalance(fromKeyPair.publicKey)
        // Create a test transaction to calculate fees
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeyPair.publicKey,
                toPubkey: toPublicKey,
                lamports: balance,
            }));
        transaction.recentBlockhash = (await
            connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = fromKeyPair.publicKey;
        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
        const fee = (await
            connection.getFeeForMessage(transaction.compileMessage(),
                'confirmed')).value || 0;
        // Remove our transfer instruction to replace it
        transaction.instructions.pop();
        // Now add the instruction back with correct amount of lamports
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: fromKeyPair.publicKey,
                toPubkey: toPublicKey,
                lamports: balance - fee,
            }));
        // Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [fromKeyPair as Signer]
        );
        console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    } catch (e) {
        console.error(`Oops, something went wrong transferring remaining balance: ${e}`)
    }
};

emptyDevnetWalletIntoWbaWallet(fromKeyPair, toPublicKey, connection);