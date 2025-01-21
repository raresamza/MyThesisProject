import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "../ui/card";
import { Button} from "../ui/button"

interface ThesisProposalCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const ThesisProposalCard: React.FC<ThesisProposalCardProps> = ({ title, description, onClick }) => {
  return (
    <>
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onClick} variant="default" className="mt-2">
          View Details
        </Button>
      </CardContent>
    </Card>
    </>
  );
};

export default ThesisProposalCard;
