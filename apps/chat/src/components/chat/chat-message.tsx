interface Props {
  content: string;
  type: "human" | "ai";
}

export default function ChatMessage({ type, content }: Props) {
  return <Card>ChatMessage</Card>;
}
