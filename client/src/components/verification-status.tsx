import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { StudentProfile } from "@/types";

interface VerificationStatusProps {
  status: StudentProfile["verificationStatus"];
  university?: string;
  studentId?: string;
  showDetails?: boolean;
}

export function VerificationStatus({ 
  status, 
  university, 
  studentId, 
  showDetails = false 
}: VerificationStatusProps) {
  const statusConfig = {
    APPROVED: {
      label: "Verified Student",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700",
      iconColor: "text-green-600",
    },
    PENDING: {
      label: "Pending Review",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700",
      iconColor: "text-yellow-600",
    },
    REJECTED: {
      label: "Verification Failed",
      icon: XCircle,
      className: "bg-red-100 text-red-700",
      iconColor: "text-red-600",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (showDetails) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Verification Status</h2>
        <div className="text-center">
          <div className={`w-16 h-16 ${config.className} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`${config.iconColor} text-xl`} />
          </div>
          <Badge className={config.className} data-testid="badge-verification-status">
            {config.label}
          </Badge>
          {university && (
            <p className="text-gray-600 text-sm mt-2" data-testid="text-university">
              {university}
            </p>
          )}
          {studentId && (
            <p className="text-gray-500 text-xs mt-1" data-testid="text-student-id">
              ID: {studentId}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <Badge className={config.className} data-testid="badge-verification-status">
        {config.label}
      </Badge>
    </div>
  );
}
