import React from "react";
import dayjs from "dayjs";
import { injectIntl } from "react-intl";
import { LocalizationProvider, DatePicker as MUIDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { formatMessage } from "../helpers/i18n";

const MonthYearPicker = ({ intl, module = "core", label, value, onChange, required = false, readOnly = false }) => {
  const selectedMonth = value ? dayjs(`${value}-01`) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MUIDatePicker
        views={["year", "month"]}
        openTo="month"
        format="MM/YYYY"
        value={selectedMonth}
        label={label ? formatMessage(intl, module, label).concat(required ? " *" : "") : null}
        required={required}
        disabled={readOnly}
        onChange={(date) => onChange?.(date?.isValid() ? date.format("YYYY-MM") : null)}
      />
    </LocalizationProvider>
  );
};

export { MonthYearPicker };
export default injectIntl(MonthYearPicker);
