This folder contains the code for predictive modelling

# External Library 
External Library - https://kbdi-ffdi.readthedocs.io/en/latest/index.html
Author: Jacob Arndt

# FFDI(Forest Fire Danger Index) and API(Antecedent Precipitation Index) formula 
*	API -  https://www.researchgate.net/publication/254943794_Predicting_Forest_Fire_Danger_Using_Improved_Model_Derived_Soil_Moisture_and_Antecedent_Precipitation
*	FFDI - https://www.bushfirecrc.com/sites/default/files/managed/resource/ctr_010_0.pdf

# Step by step to run predictive modelling
1)  Install Anaconda Python 3.8 64-Bit free version - https://www.anaconda.com/products/individual
	- Scroll down to see for Anaconda Python 3.8 64-Bit setup.
2)  open up Anaconda prompt after installation.
3)  type cd <directory to this folder> on Anaconda prompt, for example cd C:\Project\Identifire\predictive-modelling for windows. 
4)  type run_prediction.bat on Anaconda prompt.
5)  go to dataset folder which can be found within Identifire folder. 
6)  go to output folder. 
7)  bushfire_prediction.csv can be found here and it can be used to visualize in tableau.

# Step by step to use the visualization for predictive modelling
1)  Install Tableau desktop for staff/student - https://www.tableau.com/products/desktop/download
	- click the 'STUDENT OR TEACHER? GET A FREE 1-YEAR LICENSE. LEARN MORE'
2)  open up Tableau desktop app. 
3)  load VisualizationBushfire.twb into Tableau desktop.
4)  Tableau will shows all visualization in making, feel free to do anything on the tableau. 
5)  Alternatively, you can skip step 1 to 4 if you only interested with visualization: https://public.tableau.com/profile/samael#!/vizhome/VisualizationBushfire/Bushfire_Story

# Step by step to test essential function in predictive modelling
1)  Install Anaconda Python 3.8 64-Bit free version - https://www.anaconda.com/products/individual
	- Scroll down to see for Anaconda Python 3.8 64-Bit setup
2)  open up Anaconda prompt after installation 
3)  type cd <directory to this folder> on Anaconda prompt, for example cd C:\Project\Identifire\predictive-modelling for windows 
4)  type run_prediction_test.bat on Anaconda prompt
