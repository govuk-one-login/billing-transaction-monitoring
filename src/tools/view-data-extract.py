import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame

args = getResolvedOptions(sys.argv, ["JOB_NAME"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

athena_view_dataframe = (
    glueContext.read.format("jdbc")
    .option("driver", "com.simba.athena.jdbc.Driver")
    .option("AwsCredentialsProviderClass","com.simba.athena.amazonaws.auth.InstanceProfileCredentialsProvider")
    .option("url", "jdbc:awsathena://athena.eu-west-2.amazonaws.com:443")
    .option("dbtable", "AwsDataCatalog.di-btm-marks-1-calculations.btm_billing_and_transactions_curated")
    .option("S3OutputLocation","s3://di-btm-marks-1-storage/btm_extract_data/full-extract.json")
    .load()
)

athena_view_dataframe.printSchema()

athena_view_datasource = DynamicFrame.fromDF(athena_view_dataframe, glueContext, "athena_view_source")

pq_output = glueContext.write_dynamic_frame.from_options(
    frame=athena_view_datasource,
    connection_type="s3",
    format="glueparquet",
    connection_options={
        "path": "s3://di-btm-marks-1-storage/",
        "partitionKeys": [],
    },
    format_options={"compression": "snappy"},
    transformation_ctx="ParquetConversion",
)

job.commit()
