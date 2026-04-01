import random
import re

def generate_diet_and_exercise_plan(target_calories_str, target_macros_str, workout_type, intensity):
    """
    Dynamically and statistically generates daily meals and workouts based on the classification
    produced by the lifestyle_rf_model.
    """
    
    # 1. Parse Target Calories into a numeric baseline
    # Example format: '1800-2200'
    try:
        cal_parts = target_calories_str.split('-')
        base_cals = (int(cal_parts[0]) + int(cal_parts[1])) // 2
    except:
        base_cals = 2000
    
    # 2. Parse Macros into Percentages
    # Example format: 'Low Carb (40c/30p/30f)'
    carb_pct = 50
    pro_pct = 25
    fat_pct = 25
    
    match = re.search(r'\((\d+)c/(\d+)p/(\d+)f\)', target_macros_str)
    if match:
        carb_pct = int(match.group(1))
        pro_pct = int(match.group(2))
        fat_pct = int(match.group(3))
        
    # Translate percentages and baseline calories into grams
    target_carbs_g = int((base_cals * (carb_pct / 100)) / 4)
    target_pro_g = int((base_cals * (pro_pct / 100)) / 4)
    target_fat_g = int((base_cals * (fat_pct / 100)) / 9)

    # 3. Generate Meals
    def create_meal(type_name, cal_ratio, time, is_low_carb=False):
        meal_cals = int(base_cals * cal_ratio)
        meal_carbs = int(target_carbs_g * cal_ratio)
        meal_pro = int(target_pro_g * cal_ratio)
        meal_fat = int(target_fat_g * cal_ratio)
        
        # Clinical synthetic food items pool
        breakfasts = [
            [{"name": "Oatmeal with berries", "cal": int(meal_cals*0.6)}, {"name": "Greek yogurt", "cal": int(meal_cals*0.4)}],
            [{"name": "Avocado toast on whole wheat", "cal": int(meal_cals*0.7)}, {"name": "Boiled egg", "cal": int(meal_cals*0.3)}],
            [{"name": "Protein smoothie", "cal": int(meal_cals*0.8)}, {"name": "Almonds", "cal": int(meal_cals*0.2)}]
        ]
        low_carb_breakfasts = [
            [{"name": "Scrambled eggs with spinach", "cal": int(meal_cals*0.6)}, {"name": "Turkey sausage", "cal": int(meal_cals*0.4)}],
            [{"name": "Cottage cheese with walnuts", "cal": int(meal_cals*0.7)}, {"name": "Black coffee", "cal": 0}],
        ]
        
        lunches = [
            [{"name": "Grilled chicken salad", "cal": int(meal_cals*0.5)}, {"name": "Quinoa", "cal": int(meal_cals*0.5)}],
            [{"name": "Turkey wrap", "cal": int(meal_cals*0.6)}, {"name": "Mixed fruit", "cal": int(meal_cals*0.4)}],
        ]
        
        dinners = [
            [{"name": "Baked salmon", "cal": int(meal_cals*0.5)}, {"name": "Sweet potato", "cal": int(meal_cals*0.3)}, {"name": "Steamed broccoli", "cal": int(meal_cals*0.2)}],
            [{"name": "Lean beef stir-fry", "cal": int(meal_cals*0.6)}, {"name": "Brown rice", "cal": int(meal_cals*0.4)}],
        ]
        low_carb_dinners = [
            [{"name": "Grilled steak", "cal": int(meal_cals*0.6)}, {"name": "Asparagus", "cal": int(meal_cals*0.4)}],
            [{"name": "Zucchini noodles with turkey meatballs", "cal": int(meal_cals*0.9)}, {"name": "Olive oil dressing", "cal": int(meal_cals*0.1)}],
        ]
        
        snacks = [
            [{"name": "Apple with peanut butter", "cal": meal_cals}],
            [{"name": "Mixed nuts", "cal": meal_cals}],
            [{"name": "Carrot sticks & hummus", "cal": meal_cals}]
        ]
        
        items = []
        if type_name == "Breakfast":
            items = random.choice(low_carb_breakfasts if is_low_carb else breakfasts)
        elif type_name == "Lunch":
            items = random.choice(lunches) # Both generic and specific can overlap
        elif type_name == "Dinner":
            items = random.choice(low_carb_dinners if is_low_carb else dinners)
        else:
            items = random.choice(snacks)

        return {
            "type": type_name,
            "time": time,
            "items": items,
            "macros": {
                "calories": meal_cals,
                "protein": meal_pro,
                "carbs": meal_carbs,
                "fat": meal_fat
            }
        }

    is_lc = "Low Carb" in target_macros_str
    
    daily_meals = [
        create_meal("Breakfast", 0.25, "7:00 AM", is_lc),
        create_meal("Lunch", 0.35, "1:00 PM", False),
        create_meal("Dinner", 0.25, "7:00 PM", is_lc),
        create_meal("Snacks", 0.15, "Throughout day", is_lc)
    ]
    
    # 4. Generate Workouts
    duration_map = {"Low": "20 min", "Moderate": "30-45 min", "High": "45-60 min"}
    cal_burn_map = {"Low": random.randint(100, 150), "Moderate": random.randint(200, 350), "High": random.randint(400, 600)}
    
    workout_names = []
    if "Cardio" in workout_type: workout_names.extend(["Morning Jog", "Swimming", "Cycling"])
    elif "Yoga" in workout_type: workout_names.extend(["Vinyasa Yoga", "Pilates", "Stretching Routine"])
    elif "HIIT" in workout_type: workout_names.extend(["HIIT Circuit", "Heavy Weightlifting", "CrossFit WOD"])
    else: workout_names.extend(["Brisk Walking", "Bodyweight Exercises"])

    # Base daily workouts (1-2 per day depending on intensity)
    num_workouts = 1 if intensity == "Low" else 2
    daily_workouts = []
    for i in range(num_workouts):
        daily_workouts.append({
            "name": random.choice(workout_names),
            "type": "Cardio" if "Cardio" in workout_type or "Walking" in workout_type else "Strength",
            "intensity": intensity,
            "time": "7:00 AM" if i == 0 else "5:30 PM",
            "duration": duration_map.get(intensity, "30 min"),
            "calories": cal_burn_map.get(intensity, 250),
            "done": False
        })
        
    # 5. Generate Weekly Summaries
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    week_meals = []
    week_workouts = []
    
    for d in days:
        var_cal = base_cals + random.randint(-150, 150)
        week_meals.append({
            "day": d,
            "meals": 4,
            "calories": var_cal,
            "protein": target_pro_g + random.randint(-10, 10)
        })
        
        var_burn = (cal_burn_map.get(intensity, 250) * num_workouts) + random.randint(-50, 50)
        is_rest = random.random() < 0.2 and d in ["Saturday", "Sunday"] # 20% chance of rest on weekends
        
        week_workouts.append({
            "day": d,
            "workouts": 0 if is_rest else num_workouts,
            "calories": 0 if is_rest else var_burn,
            "duration": "0 min" if is_rest else duration_map.get(intensity, "30 min")
        })

    return {
        "daily_goals": {
            "target_calories": base_cals,
            "target_protein": target_pro_g,
            "target_carbs": target_carbs_g,
            "target_fat": target_fat_g
        },
        "daily_meals": daily_meals,
        "daily_workouts": daily_workouts,
        "weekly_meals": week_meals,
        "weekly_workouts": week_workouts
    }
