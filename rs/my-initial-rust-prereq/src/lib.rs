mod programs;

#[cfg(test)]
mod tests {
    use crate::programs::wba_prereq::{CompleteArgs, UpdateArgs, WbaPrereqProgram};
    use bs58;
    use solana_client::rpc_client::RpcClient;
    use solana_program::{pubkey::Pubkey, system_instruction::transfer, system_program};
    use solana_sdk::{
        message::Message,
        signature::{read_keypair_file, Keypair, Signer},
        transaction::Transaction,
    };
    use std::io::{self, BufRead};
    use std::str::FromStr;

    const RPC_URL: &str = "https://api.devnet.solana.com";

    #[test]
    // 1.2 Generating a Keypair
    // We're going to create the keygen function to generate ourselves a new keypair. We'll start by importing Keypair, Signer and Pubkey from solana_sdk
    // Now we're going to create a new Keypair, and print out our new keypair to the console!
    fn keygen() {
        let kp = Keypair::new();
        println!(
            "You've generated a new Solana wallet: {}",
            kp.pubkey().to_string()
        );
        println!("");
        println!("To save your wallet, copy and paste the following into a JSON file:");
        println!("{:?}", kp.to_bytes());
    }
    #[test]
    fn base58_to_wallet() {
        println!("Input your private key as base58:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file is:");
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("{:?}", wallet);
    }
    #[test]
    fn submit_prereq() {
        let rpc_client = RpcClient::new(RPC_URL);
        let signer = read_keypair_file("./src/wba-wallet.json").expect("Couldn't find wallet file");
        // let prereq_bytes = str::as_bytes("prereq");
        let prereq = WbaPrereqProgram::derive_program_address(&[
            b"prereq",
            signer.pubkey().to_bytes().as_ref(),
        ]);

        // We have to populate our instruction data. In this case, we are setting your Github account username:
        let args = CompleteArgs {
            github: b"slimrealm".to_vec(),
        };
        // To publish our transaction, as we last time, we need to get a recent block hash:
        let blockhash = rpc_client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");
        // Now we need to populate our complete function:
        // Now we can invoke the "complete" function
        let transaction = WbaPrereqProgram::complete(
            &[&signer.pubkey(), &prereq, &system_program::id()],
            &args,
            Some(&signer.pubkey()),
            &[&signer],
            blockhash,
        );
        // Finally, we publish our transaction! // Send the transaction
        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");
        // Print our transaction out
        println!(
            "Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        );
    }
    #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a wallet file byte array:");
        let stdin = io::stdin();
        let wallet = stdin
            .lock()
            .lines()
            .next()
            .unwrap()
            .unwrap()
            .trim_start_matches('[')
            .trim_end_matches(']')
            .split(',')
            .map(|s| s.trim().parse::<u8>().unwrap())
            .collect::<Vec<u8>>();
        println!("Your private key is:");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }
    #[test]
    fn airdrop() {
        // Import our keypair
        let keypair =
            read_keypair_file("./src/dev-wallet.json").expect("Couldn't find wallet file");
        // Then we'll establish a connection to Solana devnet using the const we defined above:
        // Connected to Solana Devnet RPC Client
        let client = RpcClient::new(RPC_URL);
        // Finally, we're going to call the airdrop function:
        // We're going to claim 2 devnet SOL tokens (2 billion lamports)
        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
            Ok(s) => {
                println!("Success! Check out your TX here:");
                println!(
                    "https://explorer.solana.com/tx/{}?cluster=devnet",
                    s.to_string()
                );
            }
            Err(e) => println!("Oops, something went wrong: {}", e.to_string()),
        };
    }
    #[test]
    // Get the exact balance of the account
    // Calculate the fee of sending the transaction
    // Calculate the exact number of lamports we can send whilst satisfying the fee rate Start by adding Message to our imports.
    fn transfer_sol() {
        // Import our keypair
        let keypair =
            read_keypair_file("./src/dev-wallet.json").expect("Couldn't find wallet file");
        // Define our WBA public key
        let to_pubkey = Pubkey::from_str("3tHnti46vNqKpa4Xtd6r1GtQrGZuApHZ6tTUDNPcLSwT").unwrap();
        // Now let's create a Solana devnet connection
        let rpc_client = RpcClient::new(RPC_URL);
        // In order to sign transactions, we're going to need to get a recent blockhash, as signatures are designed to expire as a security feature
        let recent_blockhash = rpc_client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");

        // To empty the account, we're going to have to find out how much balance it has. We can do that like so
        let balance = rpc_client
            .get_balance(&keypair.pubkey())
            .expect("Failed to get balance");
        // Now that we have the balance, we need to calculate the current fee rate for sending a transaction on devnet. To do that, we need to make a mock transaction and ask the RPC client how much it would cost to publish. We'll start by making the mock transaction as a Message.
        // Create a test transaction to calculate fees
        let message = Message::new_with_blockhash(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
            Some(&keypair.pubkey()),
            &recent_blockhash,
        );
        // Now we need to ask the RPC Client what the fee for this mock transaction would be:
        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
        let fee = rpc_client
            .get_fee_for_message(&message)
            .expect("Failed to get fee calculator");
        // Now that we have the balance and the fee, it's simply a matter of copying the transaction code from above and replacing the 100_000_000 lamports with the value of balance - fee:
        // Deduct fee from lamports amount and create a TX with correct balance
        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash,
        );

        // FORMER task to transfer 0.1 SOL from our dev wallet to our WBA wallet address on the Solana devnet.
        // let transaction = Transaction::new_signed_with_payer(
        //     &[transfer(&keypair.pubkey(), &to_pubkey, 100_000_000u64)],
        //     Some(&keypair.pubkey()),
        //     &vec![&keypair],
        //     recent_blockhash,
        // );

        // Submit our transaction and grab the TX signature
        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");
        // Print a link to the TX out to the terminal
        println!(
            "Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        );
    }
}
