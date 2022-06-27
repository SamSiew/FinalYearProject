#Author: Siew Ming Shern
#Purpose: Extract FTP file from bom.gov.au and preprocess file. 

#disable warning and install necessary library
options(warn=-1)
script.dir <- dirname(sys.frame(1)$ofile)
setwd(script.dir)
source("Preprocessing_Util.R", chdir = TRUE)

#create a clean directory for data from ftp goverment. 
unlink("data", recursive=TRUE)
dir.create(file.path(getwd(), 'data'), showWarnings = FALSE)
#Extract data from ftp.
link_address <- "ftp://ftp.bom.gov.au/anon/gen/clim_data/IDCKWCDEA0.tgz"
download.file(link_address, "data/weather.tgz")
untar("data/weather.tgz", exdir = "data/")

#list all file in nsw directory
dir_list_nsw = data.frame("directory" = list.dirs(path = "data/tables/nsw", full.names = TRUE, recursive = FALSE))
#list all file in nt directory
dir_list_nt = data.frame("directory"= list.dirs(path = "data/tables/nt", full.names = TRUE, recursive = FALSE))
#list all file in qld directory
dir_list_qld = data.frame("directory"= list.dirs(path = "data/tables/qld", full.names = TRUE, recursive = FALSE))
#list all file in sa directory
dir_list_sa = data.frame("directory"= list.dirs(path = "data/tables/sa", full.names = TRUE, recursive = FALSE))
#list all file in tas directory
dir_list_tas = data.frame("directory"= list.dirs(path = "data/tables/tas", full.names = TRUE, recursive = FALSE))
#list all file in vic directory
dir_list_vic = data.frame("directory"= list.dirs(path = "data/tables/vic", full.names = TRUE, recursive = FALSE))
#list all file in wa directory
dir_list_wa = data.frame("directory"= list.dirs(path = "data/tables/wa", full.names = TRUE, recursive = FALSE))

#merge all directory path into a data frame file_path
file_path = merge(x = dir_list_nsw, y = dir_list_nt, all = TRUE)
file_path = merge(x = file_path, y = dir_list_qld, all = TRUE)
file_path = merge(x = file_path, y = dir_list_sa, all = TRUE)
file_path = merge(x = file_path, y = dir_list_tas, all = TRUE)
file_path = merge(x = file_path, y = dir_list_vic, all = TRUE)
file_path = merge(x = file_path, y = dir_list_wa, all = TRUE)

#exclude only few data according to generated id since it data size is too small for prediction
exclusion = c(314,331,606,333,428)
#perform preprocessing for all dataset for all states to collate all weather station and clean the data for prediction. 
for(index in 1:nrow(file_path)) 
{
  if (index %in% exclusion == FALSE){
    get_data_table(file_path[index,1], index)
  } 
}
