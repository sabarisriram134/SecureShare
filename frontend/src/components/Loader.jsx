import React from "react";

export default function Loader({ text = "Loading..." }) {
  return <div style={{ padding:20 }}>{text}</div>;
}
