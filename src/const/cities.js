const cities = [
	//North America
	{'city': 'Anchorage', 'latitude': 61, 'longitude': -150},
	{'city': 'Austin', 'latitude': 30, 'longitude': -98},
	{'city': 'Calgary', 'latitude': 51, 'longitude': -114},
	{'city': 'Denver', 'latitude': 40, 'longitude': -105},
	{'city': 'Havana', 'latitude': 23, 'longitude': -82},
	{'city': 'Honolulu', 'latitude': 21, 'longitude': -158},
	{'city': 'Los Angeles', 'latitude': 34, 'longitude': -118},
	{'city': 'Mexico City', 'latitude': 19, 'longitude': -99},
	{'city': 'New York', 'latitude': 41, 'longitude': -74},
	{'city': 'Orlando', 'latitude': 29, 'longitude': -81},
	{'city': 'Panama City', 'latitude': 9, 'longitude': -80},
	{'city': 'San Francisco', 'latitude': 38, 'longitude': -122},
	{'city': 'Vancouver', 'latitude': 49, 'longitude': -123},
	{'city': 'Winnipeg', 'latitude': 50, 'longitude': -97},
	
	
	//Asia
	{'city': 'Bangkok', 'latitude': 14, 'longitude': 101},
	{'city': 'Beijing', 'latitude': 41, 'longitude': 116},
	{'city': 'Bengaluru', 'latitude': 13, 'longitude': 78},
	{'city': 'Hong Kong', 'latitude': 22, 'longitude': 114},
	{'city': 'Hanoi', 'latitude': 21, 'longitude': 106},
	{'city': 'Jakarta', 'latitude': -6, 'longitude': 107},
	{'city': 'New Delhi', 'latitude': 29, 'longitude': 77},
	{'city': 'Nur-Sultan', 'latitude': 51, 'longitude': 71},
	{'city': 'Seoul', 'latitude': 38, 'longitude': 127},
	{'city': 'Singapore', 'latitude': 1, 'longitude': 104},
	{'city': 'Tokyo', 'latitude': 36, 'longitude': 140},
	
	//Oceania
	{'city': 'Auckland', 'latitude': -37, 'longitude': 175},
	{'city': 'Perth', 'latitude': -32, 'longitude': 116},
	{'city': 'Port Moresby', 'latitude': -10, 'longitude': 147},
	{'city': 'Sydney', 'latitude': -34, 'longitude': 151},
	
	//South America
	{'city': 'Asuncion', 'latitude': -25, 'longitude': -58},
	{'city': 'Bogota', 'latitude': 5, 'longitude': -74},
	{'city': 'Buenos Aires', 'latitude': -35, 'longitude': -58},
	{'city': 'Caracas', 'latitude': 10, 'longitude': -67},
	{'city': 'La Paz', 'latitude': -16, 'longitude': -68},
	{'city': 'Lima', 'latitude': -12, 'longitude': -77},
	{'city': 'Sao Paulo', 'latitude': -23, 'longitude': -47},
	{'city': 'Santiago', 'latitude': -33, 'longitude': -71},
	{'city': 'Punta Arenas', 'latitude': -53, 'longitude': -71},
	{'city': 'Quito', 'latitude': 0, 'longitude': -78},
	
	//Africa
	{'city': 'Antananarivo', 'latitude': -19, 'longitude': 48},
	{'city': 'Cairo', 'latitude': 30, 'longitude': 31},
	{'city': 'Cape Town', 'latitude': -34, 'longitude': 18},
	{'city': 'Dakar', 'latitude': 15, 'longitude': -17},
	{'city': 'Kinshasa', 'latitude': -4, 'longitude': 15},
	{'city': 'Lagos', 'latitude': 7, 'longitude': 3},
	{'city': 'Marrakesh', 'latitude': 32, 'longitude': -8},
	{'city': 'Nairobi', 'latitude': -1, 'longitude': 37},
	{'city': 'Tunis', 'latitude': 37, 'longitude': 10},
	
	//Europe
	{'city': 'Amsterdam', 'latitude': 52, 'longitude': 5},
	{'city': 'Berlin', 'latitude': 53, 'longitude': 13},
	{'city': 'Budapest', 'latitude': 47, 'longitude': 19},
	{'city': 'Istanbul', 'latitude': 41, 'longitude': 29},
	{'city': 'Kyiv', 'latitude': 50, 'longitude': 31},
	{'city': 'London', 'latitude': 52, 'longitude': 0},
	{'city': 'Madrid', 'latitude': 40, 'longitude': 4},
	{'city': 'Moscow', 'latitude': 56, 'longitude': 38},
	{'city': 'Paris', 'latitude': 49, 'longitude': 2},
	{'city': 'Reykjavik', 'latitude': 64, 'longitude': -22},
	{'city': 'Riyadh', 'latitude': 25, 'longitude': 47},
	{'city': 'Rome', 'latitude': 42, 'longitude': 12},
	{'city': 'Stockholm', 'latitude': 59, 'longitude': 18},
	{'city': 'Tehran', 'latitude': 36, 'longitude': 51},
	{'city': 'Vienna', 'latitude': 48, 'longitude': 16},
	{'city': 'Warsaw', 'latitude': 52, 'longitude': 21}
]

export function getClosestCity(lat, lon){
	var closestdist = 10000000;
	var thislat, thislon, dist, xdiff, ydiff, closestcity, lon1, lon2;
    	for(var i = 0; i < cities.length; i++){
    		thislat = cities[i].latitude;
    		thislon = cities[i].longitude;
    		if(lon > 0 && thislon < 0){
    			lon1 = thislon;
    			lon2 = thislon + 360;
    			if(Math.abs(lon1 - lon) > Math.abs(lon2 - lon)){
    				thislon += 360;
    			}
    		}
    		if(lon < 0 && thislon > 0){
    			lon1 = thislon;
    			lon2 = thislon + 360;
    			if(Math.abs(lon1 - lon) > Math.abs(lon2 - lon)){
    				lon += 360;
    			}
    		}
    		xdiff = Math.abs(thislat - lat);
    		ydiff = Math.abs(thislon - lon);
    		dist = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2))
    		if(dist < closestdist){
    			closestdist = dist;
    			closestcity = cities[i].city;
    		}
    	}
    	return closestcity;
}

export function getInfo(city){
    	for(var i = 0; i < cities.length; i++){
    		if(cities[i].city === city){
    			return (cities[i]);
    		}	
    	}
}
