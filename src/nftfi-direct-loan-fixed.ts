import {
    LoanLiquidated,
    LoanRenegotiated,
    LoanRepaid,
    LoanStarted,
} from '../generated/NftfiDirectLoanFixed/NftfiDirectLoanFixed'
import {BigInt, Bytes} from "@graphprotocol/graph-ts";
import {Loan, LoanLiquidatedEvent, LoanRenegotiatedEvent, LoanRepaidEvent, LoanStartedEvent} from "../generated/schema";

export function handleLoanLiquidated(event: LoanLiquidated): void {
    const loanIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.loanId))
    const loan = Loan.load(loanIdBytes)
    if (loan == null) {
        throw new Error(`handleLoanLiquidated: Loan with ID ${event.params.loanId} not found`)
    }
    const loanLiquidated = new LoanLiquidatedEvent(loanIdBytes.concat(event.transaction.hash))
    loanLiquidated.loan = loanIdBytes
    loanLiquidated.borrower = event.params.borrower
    loanLiquidated.lender = event.params.lender
    loanLiquidated.loanPrincipalAmount = event.params.loanPrincipalAmount
    loanLiquidated.nftCollateralId = event.params.nftCollateralId
    loanLiquidated.loanMaturityDate = event.params.loanMaturityDate
    loanLiquidated.loanLiquidationDate = event.params.loanLiquidationDate
    loanLiquidated.nftCollateralContract = event.params.nftCollateralContract
    loanLiquidated.blockNumber = event.block.number
    loanLiquidated.blockTimestamp = event.block.timestamp
    loanLiquidated.transactionHash = event.transaction.hash
    loanLiquidated.save()
    loan.loanStatus = 'Liquidated'
    loan.loanMaturityDate = event.params.loanMaturityDate
    loan.loanLiquidationDate = event.params.loanLiquidationDate
    loan.save()
}

export function handleLoanRenegotiated(event: LoanRenegotiated): void {
    const loanIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.loanId))
    const loan = Loan.load(loanIdBytes)
    if (loan == null) {
        throw new Error(`handleLoanRenegotiated: Loan with ID ${event.params.loanId} not found`)
    }
    const loanRenegotiated = new LoanRenegotiatedEvent(loanIdBytes.concat(event.transaction.hash))
    loanRenegotiated.loan = loanIdBytes
    loanRenegotiated.borrower = event.params.borrower
    loanRenegotiated.lender = event.params.lender
    loanRenegotiated.newLoanDuration = event.params.newLoanDuration
    loanRenegotiated.newMaximumRepaymentAmount = event.params.newMaximumRepaymentAmount
    loanRenegotiated.renegotiationFee = event.params.renegotiationFee
    loanRenegotiated.renegotiationAdminFee = event.params.renegotiationAdminFee
    loanRenegotiated.blockNumber = event.block.number
    loanRenegotiated.blockTimestamp = event.block.timestamp
    loanRenegotiated.transactionHash = event.transaction.hash
    loanRenegotiated.save()
    loan.loanDuration = event.params.newLoanDuration
    loan.maximumRepaymentAmount = event.params.newMaximumRepaymentAmount
    loan.totalRenegotiationFeesPaid = loan.totalRenegotiationFeesPaid.plus(event.params.renegotiationFee)
    loan.totalRenegotiationAdminFeesPaid = loan.totalRenegotiationAdminFeesPaid.plus(event.params.renegotiationAdminFee)
    loan.save()
}

export function handleLoanRepaid(event: LoanRepaid): void {
    const loanIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.loanId))
    const loan = Loan.load(loanIdBytes)
    if (loan == null) {
        throw new Error(`handleLoanRepaid: Loan with ID ${event.params.loanId} not found`)
    }
    const loanRepaid = new LoanRepaidEvent(loanIdBytes.concat(event.transaction.hash))
    loanRepaid.loan = loanIdBytes
    loanRepaid.borrower = event.params.borrower
    loanRepaid.lender = event.params.lender
    loanRepaid.loanPrincipalAmount = event.params.loanPrincipalAmount
    loanRepaid.nftCollateralId = event.params.nftCollateralId
    loanRepaid.amountPaidToLender = event.params.amountPaidToLender
    loanRepaid.adminFee = event.params.adminFee
    loanRepaid.revenueShare = event.params.revenueShare
    loanRepaid.revenueSharePartner = event.params.revenueSharePartner
    loanRepaid.nftCollateralContract = event.params.nftCollateralContract
    loanRepaid.loanERC20Denomination = event.params.loanERC20Denomination
    loanRepaid.blockNumber = event.block.number
    loanRepaid.blockTimestamp = event.block.timestamp
    loanRepaid.transactionHash = event.transaction.hash
    loanRepaid.save()
    loan.loanStatus = 'Repaid'
    loan.amountPaidToLender = event.params.amountPaidToLender
    loan.adminFeePaid = event.params.adminFee
    loan.revenueSharePaid = event.params.revenueShare
    loan.save()
}

export function handleLoanStarted(event: LoanStarted): void {
    const loanIdBytes = Bytes.fromByteArray(Bytes.fromBigInt(event.params.loanId))
    const loanBegin = new LoanStartedEvent(loanIdBytes.concat(event.transaction.hash))
    loanBegin.loan = loanIdBytes
    loanBegin.borrower = event.params.borrower
    loanBegin.lender = event.params.lender
    loanBegin.loanPrincipalAmount = event.params.loanTerms.loanPrincipalAmount
    loanBegin.maximumRepaymentAmount = event.params.loanTerms.maximumRepaymentAmount
    loanBegin.nftCollateralId = event.params.loanTerms.nftCollateralId
    loanBegin.loanERC20Denomination = event.params.loanTerms.loanERC20Denomination
    loanBegin.loanDuration = event.params.loanTerms.loanDuration
    loanBegin.loanInterestRateForDurationInBasisPoints = event.params.loanTerms.loanInterestRateForDurationInBasisPoints
    loanBegin.loanAdminFeeInBasisPoints = event.params.loanTerms.loanAdminFeeInBasisPoints
    loanBegin.nftCollateralWrapper = event.params.loanTerms.nftCollateralWrapper
    loanBegin.loanStartTime = event.params.loanTerms.loanStartTime
    loanBegin.nftCollateralContract = event.params.loanTerms.nftCollateralContract
    loanBegin.revenueSharePartner = event.params.loanExtras.revenueSharePartner
    loanBegin.revenueShareInBasisPoints = event.params.loanExtras.revenueShareInBasisPoints
    loanBegin.referralFeeInBasisPoints = event.params.loanExtras.referralFeeInBasisPoints
    loanBegin.blockNumber = event.block.number
    loanBegin.blockTimestamp = event.block.timestamp
    loanBegin.transactionHash = event.transaction.hash
    loanBegin.save()
    const loan = new Loan(loanIdBytes)
    loan.loanId = event.params.loanId
    loan.loanStatus = 'ActiveOrDefault'
    loan.borrower = event.params.borrower
    loan.lender = event.params.lender
    loan.loanPrincipalAmount = event.params.loanTerms.loanPrincipalAmount
    loan.maximumRepaymentAmount = event.params.loanTerms.maximumRepaymentAmount
    loan.nftCollateralId = event.params.loanTerms.nftCollateralId
    loan.loanERC20Denomination = event.params.loanTerms.loanERC20Denomination
    loan.loanDuration = event.params.loanTerms.loanDuration
    loan.loanInterestRateForDurationInBasisPoints = event.params.loanTerms.loanInterestRateForDurationInBasisPoints
    loan.loanAdminFeeInBasisPoints = event.params.loanTerms.loanAdminFeeInBasisPoints
    loan.nftCollateralWrapper = event.params.loanTerms.nftCollateralWrapper
    loan.loanStartTime = event.params.loanTerms.loanStartTime
    loan.nftCollateralContract = event.params.loanTerms.nftCollateralContract
    loan.revenueSharePartner = event.params.loanExtras.revenueSharePartner
    loan.revenueShareInBasisPoints = event.params.loanExtras.revenueShareInBasisPoints
    loan.referralFeeInBasisPoints = event.params.loanExtras.referralFeeInBasisPoints
    loan.totalRenegotiationFeesPaid = BigInt.fromI32(0)
    loan.totalRenegotiationAdminFeesPaid = BigInt.fromI32(0)
    loan.save()
}
