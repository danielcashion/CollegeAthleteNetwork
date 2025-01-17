import React, { ReactNode } from "react";
interface IProps {
  children: ReactNode;
}

const ConstrainedWidth = (props: IProps) => {
  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: "1280px",
        padding: "0 17px",
      }}
    >
      {props.children}
    </div>
  );
};

export default ConstrainedWidth;
