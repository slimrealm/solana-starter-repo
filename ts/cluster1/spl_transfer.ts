import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//const signer = createSignerFromKeypair(umi, keypair); // TODO: not needed?

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";

const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("GMiaYohwvTMateXbxeX1kqF5FrSVvH5RGa9dGrqSa1Ui");

// Recipient address
const to = new PublicKey("3tHnti46vNqKpa4Xtd6r1GtQrGZuApHZ6tTUDNPcLSwT");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,

        );
        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to);

        // Transfer the new token to the "toTokenAccount" we just created
        const tx = await transfer(connection, keypair, fromTokenAccount.address, toTokenAccount.address, keypair, 1e6);
        console.log(`Transaction signature: ${tx}`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
