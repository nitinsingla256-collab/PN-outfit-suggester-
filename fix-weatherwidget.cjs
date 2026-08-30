const fs = require('fs');

let code = fs.readFileSync('src/components/ui/WeatherWidget.tsx', 'utf8');

code = code.replace(/if \(navigator\.geolocation\) {[\s\S]*?if \(mounted\) setWeather\(data\);\n\s*}/, `const data = await weatherService.getAutoLocationWeather(user?.location || 'New York');
        if (mounted) setWeather(data);`);

fs.writeFileSync('src/components/ui/WeatherWidget.tsx', code);
