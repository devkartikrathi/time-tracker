# Time Tracking Application — Detailed Structure

## 🎯 Vision
A simple yet powerful *time tracking web application* that helps users break down their 24 hours into *Rest, Work, and Other* categories, while allowing them to define their own *subcategories* and analyze how their time contributes to their *overall well-being*.  

Primary Design Rule:
- *Primary Color:* #000000 (Black)  
- *Design Inspiration:* [Vercel](https://vercel.com) (clean, minimalist, futuristic, premium feel)  

---

## 🖥 Application Layout

### 1. *Main Dashboard (Default View)*
- First screen the user sees upon login.  
- Displays *24 squares* for the current day (1 square = 1 hour).  
- Each square can be clicked to add/edit a task.  
- Users define *subcategories* before filling in boxes.  

#### Key Features:
- *Three Main Categories:*
  1. Rest
  2. Work
  3. Other/Personal
- *Subcategories (Customizable):*
  - Users can create their own subcategories within each main category.  
  - Each subcategory gets a *color* (shades of the parent category’s primary color).  

#### Example:
- *Resting:* Gray (#808080)  
  - Sleep (default) → Medium Gray  
- *Work (Primary = Green):*
  - Coding → Dark Green  
  - Studying → Light Green  
- *Other (Primary = Pink):*
  - Talking to friends → Light Pink  
  - Spiritual Learning → Orange  
  - Entertainment → Red  

#### Visual Style:
- Black background (#000000) with *minimalist grid of squares*.  
- Squares filled with category/subcategory colors.  
- Hover/click → shows task name, subcategory, and optional tags.  

---

### 2. *Analytics Tab*
- Accessible as a separate tab (like Vercel’s navigation).  
- Displays *time distribution insights*:  

#### Features:
- *Pie Chart*: Breakdown of hours spent per category/subcategory.  
- *Bar/Line Charts*: Trends over days/weeks/months.  
- *Goals Tracking:*
  - Users can set goals (e.g., “Study 4 hrs/day”).  
  - Analytics shows progress toward these goals.  
- *Well-being Wheel Mapping*:
  - Tasks can be optionally tagged into *Physical, Mental, Social, Spiritual, Growth, Family, Mission, Money, Romance, Friends, Joy*.  
  - Charts show balance across these life aspects.  

---

### 3. *AI Insights Tab*
- Advanced AI-driven analysis based on user’s logged data.  

#### Core Functions:
1. *Recommendations:*
   - Detects imbalance or patterns.
   - Example:  
     - "You’ve worked 8 consecutive hours. Take a short break."  
     - "You haven’t logged any Physical activity for 5 days. Consider exercising."  
     - "You’re spending a lot of time on Entertainment. Try balancing with Growth activities."  

2. *Trends & Predictions:*
   - Forecasts how the user’s habits will look in the future if current behavior continues.  
   - Example: “At this pace, you’ll hit your 20hr study goal in 5 days.”  

3. *Balance Suggestions:*
   - Aligns with the *Well-being Wheel*.  
   - Encourages time allocation across Physical, Mental, Social, Spiritual, Growth, Joy, etc.  

---

## 🗂 Data Model (Conceptual)

### Categories
- *Rest*
  - Default: Sleep
  - Custom: User-defined
- *Work*
  - Example: Coding, Studying, Meetings
- *Other/Personal*
  - Example: Chores, Friends, Entertainment, Spiritual, Learning

### Task Object
```json
{
  "date": "2025-09-28",
  "hour": 14,
  "task_name": "Coding",
  "main_category": "Work",
  "subcategory": "Coding",
  "color": "#006400",
  "tags": ["Growth", "Mental"],
  "duration": 1
}


⸻

📊 User Journey
	1.	Login → Dashboard
	•	User sees empty daily grid (24 hours).
	2.	Setup Categories
	•	User defines subcategories and assigns colors.
	3.	Fill Time Blocks
	•	Click → Add task → Assign category + subcategory + color.
	4.	View Analytics
	•	Switch to analytics tab → See charts & breakdowns.
	5.	AI Insights
	•	Switch to insights tab → Get recommendations, trends, and suggestions.

⸻

🔮 Future Extensions
	•	Calendar sync (Google, Outlook).
	•	Export reports (CSV, PDF).
	•	Gamification (streaks, badges).
	•	Mobile app integration with notifications.
	•	AI chatbot assistant inside dashboard.

⸻

📝 Summary

This application starts as a simple 24-hour block tracker (minimal dashboard, black-themed, Vercel-inspired UI).
Users can build their own subcategories with custom colors, track tasks easily, and view progress in the Analytics Tab.
In the AI Insights Tab, users will receive personalized recommendations, predictions, and balance suggestions for better productivity and well-being.

The core promise:
Even if the user ignores all other features, the simple daily time tracking grid will remain the most valuable, minimal, and essential feature.
