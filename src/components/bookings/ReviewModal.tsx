import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { rateBooking, reportIssue } from "@/api/AdminApi";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onSuccess: () => void;
}

export const ReviewModal = ({ isOpen, onClose, booking, onSuccess }: ReviewModalProps) => {
    const [step, setStep] = useState<"ask" | "rate" | "report">("ask");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Rating State
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");

    // Issue State
    const [issueReason, setIssueReason] = useState("");
    const [issueDescription, setIssueDescription] = useState("");

    const reset = () => {
        setStep("ask");
        setRating(0);
        setReview("");
        setIssueReason("");
        setIssueDescription("");
        setIsSubmitting(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const submitRating = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            await rateBooking({
                bookingId: booking.id,
                providerId: booking.provider_id,
                rating,
                review // Optional backend support for review text can be added later or ignored if not in schema yet
            });
            toast.success("Thank you for your feedback!");
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error("Failed to submit rating.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitIssue = async () => {
        if (!issueReason || !issueDescription) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await reportIssue({
                bookingId: booking.id,
                reason: issueReason,
                description: issueDescription
            });
            toast.success("Issue reported. Support will review it shortly.");
            onSuccess();
            handleClose();
        } catch (error) {
            toast.error("Failed to report issue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Service</DialogTitle>
                    <DialogDescription>
                        {step === "ask" && "Did everything go as expected?"}
                        {step === "rate" && "Great! Rate your experience."}
                        {step === "report" && "We're sorry to hear that. What went wrong?"}
                    </DialogDescription>
                </DialogHeader>

                {/* STEP 1: ASK */}
                {step === "ask" && (
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-32 flex flex-col gap-3 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all"
                            onClick={() => setStep("rate")}
                        >
                            <div className="bg-green-100 p-3 rounded-full">
                                <ThumbsUp className="w-8 h-8 text-green-600" />
                            </div>
                            <span className="font-semibold text-lg">Yes, all good!</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-32 flex flex-col gap-3 hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-all"
                            onClick={() => setStep("report")}
                        >
                            <div className="bg-red-100 p-3 rounded-full">
                                <ThumbsDown className="w-8 h-8 text-red-600" />
                            </div>
                            <span className="font-semibold text-lg">No, there was an issue</span>
                        </Button>
                    </div>
                )}

                {/* STEP 2A: RATE */}
                {step === "rate" && (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label>Public Review (Optional)</Label>
                            <Textarea
                                placeholder="Share details about your experience..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setStep("ask")}>Back</Button>
                            <Button onClick={submitRating} disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Rating"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* STEP 2B: REPORT ISSUE */}
                {step === "report" && (
                    <div className="space-y-4 py-4">
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p>Reporting an issue will pause the payment release to the provider until our support team reviews the case.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select onValueChange={setIssueReason} value={issueReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no_show">Provider didn't show up</SelectItem>
                                    <SelectItem value="incomplete">Job was left incomplete</SelectItem>
                                    <SelectItem value="damage">Property damage occurred</SelectItem>
                                    <SelectItem value="behavior">Unprofessional behavior</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Please describe exactly what happened..."
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                className="h-24"
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setStep("ask")}>Back</Button>
                            <Button onClick={submitIssue} disabled={isSubmitting} variant="destructive">
                                {isSubmitting ? "Reporting..." : "Report Issue"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
