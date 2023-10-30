import { Transfer as ObligationReceiptTransfer, MintCall as ObligationReceiptMintCall } from "../generated/NftfiObligationReceipt/NftfiObligationReceipt";
import { Address, Bytes } from "@graphprotocol/graph-ts";
import { Loan, ObligationReceipt } from "../generated/schema";

export function handleObligationReceiptMint(call: ObligationReceiptMintCall): void {
    const loanIdBytes = Bytes.fromUint8Array(call.inputs._data.slice(0, 32))
    const loan = Loan.load(loanIdBytes)
    if (loan != null) {
        const receiptTokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(call.inputs._tokenId))
        // We track obligation-receipt mints so that we can look up the loan ID, and thus
        //  the underlying collateral token, when one of them is transferred, since the
        //  transfer event itself doesn't include the loan ID or info about the underlying
        //  collateral
        const receipt = new ObligationReceipt(receiptTokenIdBytes)
        receipt.receiptTokenId = call.inputs._tokenId
        receipt.loan = loanIdBytes
        receipt.nftCollateralContract = loan.nftCollateralContract
        receipt.nftCollateralId = loan.nftCollateralId
        receipt.creator = loan.borrower
        receipt.holder = loan.borrower
        receipt.save()
    }
}

export function handleObligationReceiptTransfer(event: ObligationReceiptTransfer): void {
    // We handle obligation-receipt mints using the function call
    if (event.params.from === Address.zero()) {
        return
    }
    const receiptTokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.tokenId))
    const receipt = ObligationReceipt.load(receiptTokenIdBytes)
    if (receipt == null) {
        throw new Error(`Found transfer for an obligation receipt that was never minted (ID ${event.params.tokenId})`)
    }
    receipt.holder = event.params.to
    receipt.save()
    const loanIdBytes = Bytes.fromUint8Array(receipt.loan)
    const loan = Loan.load(loanIdBytes)
    if (loan == null) {
        throw new Error(`Obligation-receipt transfer (ID ${receipt.receiptTokenId}) for non-existing loan with ID ${receipt.loan}`)
    }
    loan.borrower = event.params.to
    loan.save()
}
