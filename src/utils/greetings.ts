export const getGreeting = (name: string): string => {
  const hour = new Date().getHours();
  let timeOfDay = 'day';

  if (hour < 12) {
    timeOfDay = 'morning';
  } else if (hour < 17) {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'evening';
  }

  const cleanName = name.trim();
  if (cleanName) {
    return `Good ${timeOfDay}, ${cleanName}.`;
  }
  
  return `Good ${timeOfDay}.`;
};
