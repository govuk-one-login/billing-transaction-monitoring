import { resourcePrefix } from "./helpers/envHelper";

export const VENDOR_SERVICE_CONFIG_PATH = "vendor_services/vendor-services.csv";
export const E2E_TEST_CONFIG_PATH = "e2e-test.json";
export const RATE_TABLE_CONFIG_PATH = "rate_tables/rates.csv";

export const STORAGE_BUCKET = `${resourcePrefix()}-storage`;
export const RAW_INVOICE_BUCKET = `${resourcePrefix()}-raw-invoice`;
export const RAW_INVOICE_TEXTRACT_BUCKET = `${resourcePrefix()}-raw-invoice-textract-data`;
export const TRANSACTION_CSV_BUCKET = `${resourcePrefix()}-transaction-csv`;

export const FILTER_FUNCTION = `${resourcePrefix()}-filter-function`;
export const CLEAN_FUNCTION = `${resourcePrefix()}-clean-function`;
export const STORE_FUNCTION = `${resourcePrefix()}-storage-function`;
export const INT_TEST_SUPPORT_FUNCTION = `${resourcePrefix()}-int-test-support-function`;

export const S3_TRANSACTION_FOLDER = "btm_event_data";
export const S3_INVOICE_FOLDER = "btm_invoice_data";
export const S3_INVOICE_ARCHIVED_FOLDER = "btm_invoice_data_archived";

export const DATABASE_NAME = `${resourcePrefix()}-calculations`;
export const ATHENA_WORKGROUP = `${resourcePrefix()}-athena-workgroup`;
