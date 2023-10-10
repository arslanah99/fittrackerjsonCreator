const fs = require('fs');

// Read the workout plan from the file
fs.readFile('workout_plan.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Could not read the file:', err);
    return;
  }

  let currentWeek = null;
  let currentDay = null;
  const workoutJson = {WorkoutPlan: []};

  const lines = data.split('\n');
  for (const line of lines) {
    if (line.trim() === '') {
      continue; // Skip this iteration of the loop
    }
    if (line.startsWith('Week')) {
      currentWeek = {
        WeekNumber: parseInt(line.split(' ')[1]),
        Focus: line.split(': ')[1],
        Days: [],
        IsCompleted: false,
        CompletionDate: null,
      };
      workoutJson.WorkoutPlan.push(currentWeek);
    } else if (line.startsWith('Day')) {
      const [dayNumber, dayFocus] = line.replace(')', '').split(' (');
      currentDay = {
        DayNumber: parseInt(dayNumber.split(' ')[1]),
        DayType: dayFocus,
        IsCompleted: false,
        CompletionDate: null,
        Exercises: [],
      };
      if (currentWeek) currentWeek.Days.push(currentDay);
    } else if (
      line.startsWith('Specialized Exercises:') ||
      line.startsWith('Accessory Work:')
    ) {
      // Skip this line
    } else {
      const [exercise, presets] = line.split(' - ');
      if (exercise && presets) {
        const details = presets.split(', ');
        const exerciseInfo = {
          Name: exercise,
          Presets: {},
          Substitutions: [],
          UserInput: {
            Reps: null,
            Weight: null,
            Notes: null,
            Date: null,
          },
          Progress: [],
          Info: null,
        };

        for (const detail of details) {
          console.log(detail);
          if (detail.includes('sets')) {
            exerciseInfo.Presets['Sets'] = parseInt(detail.split(' ')[0]);
          } else if (detail.includes('reps')) {
            exerciseInfo.Presets['Reps'] = detail.split(' ')[0];
          } else if (detail.includes('% 1RM')) {
            exerciseInfo.Presets['% 1RM'] = detail.split(' ')[0];
          } else if (detail.includes('RPE')) {
            exerciseInfo.Presets['RPE'] = parseInt(detail.split(' ')[1]);
          }
          const setsMatch = detail.match(/(\d+) sets/);
          if (setsMatch) {
              exerciseInfo.Presets["Sets"] = parseInt(setsMatch[1]);
          }
      
          // This will now capture something like "15-18 reps" as well
          const repsMatch = detail.match(/(\d+(-\d+)?) reps/);
          if (repsMatch) {
              exerciseInfo.Presets["Reps"] = repsMatch[1];
          }
      
          // This will now capture something like "70-75% 1RM" as well
          const oneRmMatch = detail.match(/(\d+(\.\d+)?(-\d+(\.\d+)?)?%?) 1RM/);
          if (oneRmMatch) {
              exerciseInfo.Presets["%1RM"] = oneRmMatch[1];  // Removed space here
          }
      
          const rpeMatch = detail.match(/RPE (\d+)/);
          if (rpeMatch) {
              exerciseInfo.Presets["RPE"] = parseInt(rpeMatch[1]);
          }
        }

        if (Object.keys(exerciseInfo.Presets).length > 0) {
          currentDay.Exercises.push(exerciseInfo);
        } else {
          console.warn(`Skipping malformed line: ${line}`);
          console.log(`Problematic line content: '${line}'`);
        }
      } else {
        console.warn(`Skipping malformed line: ${line}`);
        console.log(`Problematic line content: '${line}'`);
      }
    }
  }

  fs.writeFile(
    'workout_plan.json',
    JSON.stringify(workoutJson, null, 2),
    (err) => {
      if (err) {
        console.error('Could not save JSON:', err);
        return;
      }
      console.log('Workout plan successfully converted to JSON and saved!');
    }
  );
});
