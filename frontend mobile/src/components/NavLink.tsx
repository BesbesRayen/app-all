import { ReactNode } from "react";
import { Pressable, PressableProps, Text, TextStyle } from "react-native";
import { AppRoute, useAppNavigation } from "@/lib/app-navigation";

interface NavLinkCompatProps extends Omit<PressableProps, "onPress"> {
  to: AppRoute;
  children: ReactNode;
  textStyle?: TextStyle;
}

const NavLink = ({ to, children, textStyle, ...props }: NavLinkCompatProps) => {
  const { navigate } = useAppNavigation();

  return (
    <Pressable onPress={() => navigate(to)} {...props}>
      {typeof children === "string" ? <Text style={textStyle}>{children}</Text> : children}
    </Pressable>
  );
};

export { NavLink };
