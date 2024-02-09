import geopandas as gpd
#gdf = gpd.read_file('https://services-eu1.arcgis.com/mk4XuhXpZRIhQGNA/ArcGIS/rest/services/GESTPARC_Parcelles_vendues/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson')
gdf = gpd.read_file('http://localhost:3000/geojsons/limite-intercommunales.geojson')

from sqlalchemy import create_engine
#engine = create_engine('postgresql://username:password@host:port/dbname')
# @todo implement .env file
gdf.to_postgis('limite_intercommunales', engine, if_exists='replace')
