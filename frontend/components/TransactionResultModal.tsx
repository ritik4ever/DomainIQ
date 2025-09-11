
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ExternalLink, Copy } from 'lucide-react'

interface TransactionResultModalProps {
    isOpen: boolean
    onClose: () => void
    result: any
}

export function TransactionResultModal({
    isOpen,
    onClose,
    result
}: TransactionResultModalProps) {
    if (!result) return null

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Transaction Successful
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800 font-medium">{result.message}</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Transaction Hash</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 text-xs bg-gray-100 p-2 rounded">
                                    {result.txHash}
                                </code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(result.txHash)}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {result.volume && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Volume Generated</label>
                                <p className="text-lg font-bold text-green-600">
                                    ${typeof result.volume === 'number' ? result.volume.toLocaleString() : result.volume}
                                </p>
                            </div>
                        )}

                        {result.explorerUrl && (
                            <Button
                                className="w-full"
                                onClick={() => window.open(result.explorerUrl, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on Explorer
                            </Button>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}