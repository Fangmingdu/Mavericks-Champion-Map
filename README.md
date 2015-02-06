Mavericks-Champion-Map
======================

This is a Web Map app that shows the game status of Dallas Mavericks in 2011 when they won their first Championship.

##Data Source:
- ESPN NBA game schedule
- Goolge Geocoding API for geo-locations of NBA teams (Areana location)

##Front-end Code Development:
- ArcGIS Javascript API: provides the base framework for the whole app (ESRI provides the base map)
- ClusterLayer.js: provides the function can cluster graphic points to point clusters based on location (hacked it a bit to use game status, like Win or Lost to render the symbols)
- Bootstrap/Jquery: provides some dynamic interactions


##TO-DO:
- Splash screen to tell the story
- Legend
- time animation for the games
