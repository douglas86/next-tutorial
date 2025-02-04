"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Page() {
  return (
    <>
      {process.env.NODE_ENV === "development" ? (
        <div style={{ height: "100vh" }}>
          <SwaggerUI url="https://petstore.swagger.io/v2/swagger.json" />
        </div>
      ) : (
        <p>This Page is only for Development</p>
      )}
    </>
  );
}
