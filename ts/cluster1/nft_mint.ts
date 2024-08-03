import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata, createAndMint } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../../wba-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let tx = createNft(
        umi, {
        mint,
        name: "SamRugABug",
        symbol: "SMRG",
        // authority: myKeypairSigner,
        // sellerFeeBasisPoints: percentAmount(5),
        // isCollection: false,
        // uri: "https://arweave.net/rvtcBFVREy5QYHl-tn78vYqqBtmCy1sRsllZYPy6oME",
        uri: "https://arweave.net/mhilOkKR5WVeUMXxz4cn_d43-23pY1Q7guiLh8u8OYM",
        sellerFeeBasisPoints: percentAmount(1)
    }
    );
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();
