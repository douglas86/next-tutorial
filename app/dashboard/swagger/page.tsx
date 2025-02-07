"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Page() {
  return (
    <div style={{ height: "100vh" }}>
      <SwaggerUI url="/api/openapi" />
    </div>
  );
}
