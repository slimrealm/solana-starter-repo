/*
Now that we have our wallet created, we're going to import it into another script
This time, we're going to import Keypair, but we're also going to import Connection to let us
establish a connection to the Solana devnet, and LAMPORTS_PER_SOL which lets us
conveniently send ourselves amounts denominated in SOL rather than the individual lamports
units.
*/
import { Connection, Keypair, LAMPORTS_PER_SOL } from
    "@solana/web3.js"
//We're also going to import our wallet and recreate the Keypair object using its private key:
import wallet from "./dev-wallet.json"
// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
//Now we're going to establish a connection to the Solana devnet:
//Create a Solana devnet connection to devnet SOL tokens
const connection = new Connection("https://api.devnet.solana.com");

//Finally, we're going to claim 2 devnet SOL tokens:
// (async () => {
//     try {
//         // We're going to claim 2 devnet SOL tokens
//         const txhash = await
//             connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
//         console.log(`Success! Check out your TX here:
// https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
//     } catch (e) {
//         console.error(`Oops, something went wrong: ${e}`)
//     }
// })();

//Finally, we're going to claim 2 devnet SOL tokens:
const claimDevnetSol = async (connection: Connection, keypair: Keypair) => {
    try {
        // We're going to claim 2 devnet SOL tokens
        const txhash = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong claiming 2 devnet SOL tokens: ${e}`);
    }
};

// Call the function to claim devnet SOL
claimDevnetSol(connection, keypair);
