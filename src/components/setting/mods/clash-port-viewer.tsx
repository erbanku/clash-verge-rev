import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLockFn } from "ahooks";
import { List, ListItem, ListItemText, TextField } from "@mui/material";
import { useClashInfo } from "@/hooks/use-clash";
import { BaseDialog, DialogRef, Notice } from "@/components/base";
import { useVerge } from "@/hooks/use-verge";

export const ClashPortViewer = forwardRef<DialogRef>((props, ref) => {
  const { t } = useTranslation();

  const { clashInfo, patchInfo } = useClashInfo();
  const { verge, patchVerge } = useVerge();

  const [open, setOpen] = useState(false);
  const [port, setPort] = useState(
    verge?.verge_mixed_port ?? clashInfo?.port ?? 7890
  );

  useImperativeHandle(ref, () => ({
    open: () => {
      if (verge?.verge_mixed_port) setPort(verge?.verge_mixed_port);
      setOpen(true);
    },
    close: () => setOpen(false),
  }));

  const onSave = useLockFn(async () => {
    if (port === verge?.verge_mixed_port) {
      setOpen(false);
      return;
    }
    try {
      await patchInfo({ "mixed-port": port });
      await patchVerge({ verge_mixed_port: port });
      setOpen(false);
      Notice.success("Change Clash port successfully!", 1000);
    } catch (err: any) {
      Notice.error(err.message || err.toString(), 4000);
    }
  });

  return (
    <BaseDialog
      open={open}
      title={t("Clash Port")}
      contentSx={{ width: 300 }}
      okBtn={t("Save")}
      cancelBtn={t("Cancel")}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      onOk={onSave}
    >
      <List>
        <ListItem sx={{ padding: "5px 2px" }}>
          <ListItemText primary="Mixed Port" />
          <TextField
            size="small"
            autoComplete="off"
            sx={{ width: 135 }}
            value={port}
            onChange={(e) =>
              setPort(+e.target.value?.replace(/\D+/, "").slice(0, 5))
            }
          />
        </ListItem>
      </List>
    </BaseDialog>
  );
});
