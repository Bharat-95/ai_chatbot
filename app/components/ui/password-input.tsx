import { Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/ui/input";
interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  isVisible: boolean;
  onToggle: () => void;
}

const PasswordInput = ({ isVisible, onToggle, ...props }: PasswordInputProps) => (
  <div className="relative">
    <Input type={isVisible ? "text" : "password"} {...props} />
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer"
      tabIndex={-1}                // keeps tab-order on the field itself
    >
      {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

export default PasswordInput;
