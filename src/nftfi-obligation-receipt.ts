import {
    NftfiObligationReceipt as ObligationReceiptContract,
    Transfer as ObligationReceiptTransfer,
} from "../generated/NftfiObligationReceipt/NftfiObligationReceipt";
import { Address, Bytes } from "@graphprotocol/graph-ts";
import { Loan, ObligationReceipt } from "../generated/schema";

export function handleObligationReceiptTransfer(event: ObligationReceiptTransfer): void {
    const obligationReceiptContract = ObligationReceiptContract.bind(event.address)
    const loansResult = obligationReceiptContract.loans(event.params.tokenId)
    const loanId = loansResult.getLoanId()
    const loanIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(loanId))
    const loan = Loan.load(loanIdBytes)
    if (loan == null) {
        throw new Error(`Obligation-receipt transfer (tokenId ${event.params.tokenId}, tx ${event.transaction.hash.toHexString()}) for non-existing loan with ID ${loanId}`)
    }
    loan.borrower = event.params.to
    loan.save()
    const receiptTokenIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.tokenId))
    let receipt = ObligationReceipt.load(receiptTokenIdBytes)
    if (event.params.from == Address.zero()) {
        if (receipt != null) {
            throw new Error(`Mint for already-loaded obligation receipt with ID ${event.params.tokenId}`)
        }
        receipt = new ObligationReceipt(receiptTokenIdBytes)
        receipt.receiptTokenId = event.params.tokenId
        receipt.loan = loanIdBytes
        receipt.nftCollateralContract = loan.nftCollateralContract
        receipt.nftCollateralId = loan.nftCollateralId
        receipt.creator = event.transaction.from
        receipt.holder = event.params.to
    } else {
        if (receipt == null) {
            throw new Error(`Transfer for unknown obligation receipt with ID ${event.params.tokenId}`)
        }
        receipt.holder = event.params.to
    }
    receipt.save()
}
