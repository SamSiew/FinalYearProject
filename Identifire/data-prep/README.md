*This folder contains the code for data preparation.*

# Raw Data Required For Scripts
All raw data for data preparation scripts should be located in a folder named "raw_data"
at the root of the data-prep folder.

You can access the raw data folder at this link: https://drive.google.com/drive/folders/17ZbF-ajr5YxGYDVXp4n_1ByBJFU4oH92?usp=sharing

Right click the raw_data_for_scripts folder and download. Then extract the zip file into the root of the data-prep
folder.

# Config file
Since the scripts for data prep read from and write to the database, you need to configure your postgresql connection.

There is a sample config file named sample.env located at data-prep/config/sample.env

Please fill in your own details in order to connect to a postgresql instance.

# City and station database
* list of city - https://simplemaps.com/static/data/country-cities/au/au.csv
* list of station - ftp://ftp.bom.gov.au/anon/gen/clim_data/IDCKWCDEA0/tables/

# Step by step to use Preprocessing for prediction on bushfire
1)  Install RScript free version - https://cran.r-project.org/bin/windows/base/ 
2)	Install RStudio Desktop free version - https://rstudio.com/products/rstudio/download/#download
3)  Open Preprocessing.r in Rstudio by clicking file tab then open file options.
4)  click 'Source' button which is next to run button can be located on right side.
5)  When asked wheather to install package, click yes and it will run as it should. 

# Step by step to use Unit Test for Preprocessing script
1)  Install RScript free version - https://cran.r-project.org/bin/windows/base/ 
2)	Install RStudio Desktop free version - https://rstudio.com/products/rstudio/download/#download
3)  Open UnitTest_Preprocessing.r in Rstudio by clicking file tab then open file options.
4)  click 'Run Tests' button which can be located on right side.
5)  When asked wheather to install package, click yes and it will run as it should. 
