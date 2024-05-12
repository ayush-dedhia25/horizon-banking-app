import { Control, FieldPath } from "react-hook-form";
import { z } from "zod";

import { authFormSchema } from "@/lib/formValidations";
import { FormControl, FormField, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

const formSchema = authFormSchema("sign-up");

type CustomInputProps = {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder: string;
  type?: string;
};

function CustomInput({ control, name, label, placeholder, type }: CustomInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="form-label">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <Input
                type={type || "text"}
                placeholder={placeholder}
                className="input-class"
                {...field}
              />
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </div>
      )}
    />
  );
}

export default CustomInput;
