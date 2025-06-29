import InputBox from "~/components/primitives/InputBox";
import { useThread } from "~/hooks/use-thread";

export default function Chat() {
  const { messages } = useThread();

  return (
    <div>
      {/* Message list */}
      <div></div>

      {/* Input box */}
      <InputBox />
    </div>
  );
}
