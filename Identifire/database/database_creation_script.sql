--drop table users cascade;
--drop table workspace cascade;
--drop table user_view cascade;
--drop table measurement cascade;
--drop table visualisation cascade;
--drop table measurement_visualisation cascade;
--drop table user_visualisation cascade;
--drop table location cascade;
--drop table country cascade;
--drop table state cascade;
--drop table local_government_area cascade;
--drop table weather_station cascade;
--drop table measurement_location cascade;
--drop table measurement_record cascade;
--drop table bushfire_record cascade;
--drop table weather_record cascade;
--drop table record_location cascade;

create table workspace (
	workspace_id bigint generated always as identity primary key,
	owner_email varchar(50) not null,
	workspace_name text not null check (length(workspace_name) > 0),
	workspace_colour text not null 
						  default 'FFAB00' 
						  check (workspace_colour ~* '^#([A-F0-9]{6}|[A-F0-9]{3})$'),
	unique (owner_email, workspace_name)
);

create table user_view (
	view_id bigint generated always as identity primary key,
	workspace_id bigint not null references workspace (workspace_id) on delete cascade,
	view_name text not null check (length(view_name) > 0),
	grid_layout json,
	unique (workspace_id, view_name)
);

create table measurement (
	measurement_id int generated always as identity primary key,
	name text not null unique,
	description text,
	measurement_type varchar(30) not null check (measurement_type in ('weather',
																	  'bushfire'))
);

create table visualisation (
	visualisation_name text primary key,
	description text
);

create table measurement_visualisation (
	measurement_id int references measurement (measurement_id),
	visualisation_name text references visualisation (visualisation_name),
	primary key (measurement_id, visualisation_name)
);

create table location (
	location_id bigint generated always as identity primary key,
	name text not null,
	description text,
	location_coords polygon,
	location_type varchar(30) not null check (location_type in ('country', 
													 			'state', 
																'local_government_area',  
																'weather_station'))
);

create table country (
	location_id bigint primary key references location (location_id),
	abbreviation varchar(20)
);

create table state (
	location_id bigint primary key references location (location_id),
	abbreviation varchar(10) not null,
	country_id bigint references country (location_id)
);

create table local_government_area (
	location_id bigint primary key references location (location_id),
	abbv_name text,
	state_id bigint references state (location_id)
);

create table weather_station (
	location_id bigint primary key references location (location_id),
	address text,
	lga_id bigint references local_government_area (location_id)
);

alter table local_government_area add column designated_weather_station bigint 
	references weather_station (location_id);

create table measurement_location (
	location_id bigint not null references location (location_id),
	measurement_id int not null references measurement (measurement_id),
	primary key (location_id, measurement_id)
);

create table user_visualisation (
	user_vis_id bigint generated always as identity primary key,
	view_id bigint not null references user_view (view_id) on delete cascade,
	location_id bigint not null,
	measurement_id int not null,
	visualisation_name text not null,
	vis_filter json,
	foreign key (measurement_id, visualisation_name) 
		references measurement_visualisation (measurement_id, visualisation_name),
	foreign key (location_id, measurement_id)
		references measurement_location (location_id, measurement_id)
);

create table measurement_record (
	measurement_record_id bigint generated always as identity primary key,
	measurement_id int not null references measurement (measurement_id),
	start_timestamp	timestamptz not null,
	end_timestamp timestamptz not null,
	duration interval,
	is_predicted bool not null
);

create table bushfire_record (
	measurement_record_id bigint primary key references measurement_record (measurement_record_id),
	ignition_point point,
	fire_polygon polygon,
	area_burned int,
	final_perimeter_length int,
	avg_daily_expansion int,
	avg_daily_fire_line_length int,
	avg_daily_speed int,
	dominant_direction text check(dominant_direction in ('north',
														 'northeast',
														 'east',
														 'southeast',
														 'south',
														 'southwest',
														 'west',
														 'northwest'))
);

comment on column bushfire_record.ignition_point is 'Initial ignition point (lat, lng)';
comment on column bushfire_record.fire_polygon is 'Fire perimiter as polygon of (lat, lng) coords';
comment on column bushfire_record.area_burned is 'Total area burned (km^2)';
comment on column bushfire_record.final_perimeter_length is 'Final length of fire perimeter (km)';
comment on column bushfire_record.avg_daily_expansion is 'Average daily fire expansion (km^2 per day)';
comment on column bushfire_record.avg_daily_fire_line_length is 'Average daily fire line length (km)';
comment on column bushfire_record.avg_daily_speed is 'Average daily speed of fire (km per day)';
comment on column bushfire_record.dominant_direction is 'Dominant direction of spread (north, southeast, etc.)';

create table weather_record (
	measurement_record_id bigint primary key references measurement_record (measurement_record_id),
	min_value real,
	max_value real,
	avg_value real,
	accumulated_value real,
	units varchar(20) not null,
	station_id bigint references weather_station (location_id),
	check ( min_value is not null 
	or min_value is not null
	or avg_value is not null
	or accumulated_value is not null)
);

create table record_location (
	record_location_id bigint generated always as identity primary key,
	measurement_record_id bigint not null references measurement_record (measurement_record_id),
	location_id bigint not null references location (location_id),
	unique (measurement_record_id, location_id)
);


commit;

