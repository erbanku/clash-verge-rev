import React, { ReactNode } from "react";
import { Typography, alpha } from "@mui/material";
import { BaseErrorBoundary } from "./base-error-boundary";
import { useCustomTheme } from "@/components/layout/use-custom-theme";

interface Props {
  title?: React.ReactNode; // the page title
  header?: React.ReactNode; // something behind title
  contentStyle?: React.CSSProperties;
  children?: ReactNode;
}

export const BasePage: React.FC<Props> = (props) => {
  const { title, header, contentStyle, children } = props;
  const { theme } = useCustomTheme();

  const isDark = theme.palette.mode === "dark";

  return (
    <BaseErrorBoundary>
      <div className="base-page" data-windrag>
        <header data-windrag style={{ userSelect: "none" }}>
          <Typography variant="h4" component="h1" data-windrag>
            {title}
          </Typography>

          {header}
        </header>

        <div
          className="base-container"
          style={{ backgroundColor: isDark ? "#090909" : "#ffffff" }}
        >
          <section
            style={{
              backgroundColor: isDark
                ? alpha(theme.palette.primary.main, 0.1)
                : "",
            }}
          >
            <div className="base-content" style={contentStyle} data-windrag>
              {children}
            </div>
          </section>
        </div>
      </div>
    </BaseErrorBoundary>
  );
};
