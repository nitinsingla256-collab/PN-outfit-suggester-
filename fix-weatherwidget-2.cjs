const fs = require('fs');
let code = fs.readFileSync('src/components/ui/WeatherWidget.tsx', 'utf8');

const regex = /async function fetchWeather\(\) \{[\s\S]*?\} catch \(err\) \{/;
code = code.replace(regex, `async function fetchWeather() {
      setLoading(true);
      try {
        const data = await weatherService.getAutoLocationWeather(user?.location || 'New York');
        if (mounted) setWeather(data);
      } catch (err) {`);

fs.writeFileSync('src/components/ui/WeatherWidget.tsx', code);
