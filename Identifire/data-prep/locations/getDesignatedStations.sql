-- Use these queries to generate all designated stations

select 
	lga.location_id as "lga_location_id", 
	lga.abbv_name as "lga_abbv_name", 
	l.location_id as "weather_station_location_id", 
	l."name" as "weather_station_name"
from local_government_area lga 
	join weather_station ws 
		on lga.designated_weather_station = ws.location_id
	join location l
		on ws.location_id = l.location_id;

select 
	distinct l."name", l.location_id 
from local_government_area lga 
	join weather_station ws 
		on lga.designated_weather_station = ws.location_id
	join location l
		on ws.location_id = l.location_id;