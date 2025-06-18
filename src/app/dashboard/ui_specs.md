# This is a specifications file for the ui for the dashboard
## General requirements:
- colour scheme and design must appeal to the e commmerce audience
- visual hierarchy should be present
- emphasize on larity and ease of navigation

## Evolution description:
- First generate a critique of the previous generation, saving it in the folder of the previous iteration
- Plan out your new implmentation in a file named v1_plan.md(adjust the number based on the iteration) plan using sequential thinking, understanding the evolution of the ui over the various versions, gaining insight on the designs that are good to aid in improving the ui
- After every iteration, write down a summary of the salient implementation details in v1_summary.md (adjust based on the number of iterations)
- Save each iteration of the ui in a folder named v1,v2,v3 etc 

## Dashboard structure

### Navigation bar:
The main tabs that are needed:
- subscription
- connect accounts
- algorithm optimization
- autoposting
- reports
- template generator
- competitor tactics

### Contents of each page:
**subscription**:
- the pricing page in the landing page
- an additional page for billing and invoices

**connect accounts**:
- social media accounts
- e commerce accounts

- show the connected/disconnected state

**algorithm optimization**:
- input field for videos, processing up to 30 videos at once
- progress bars on optimizing the videos:
  - description
  - hashtags
- output video list that the user can adjust the descriptions and hashtags of individually if they want to

**autoposting**:
- a calendar view:
  - user sees a calendar with only dates, no times, and the brief descripitons of the video scheduled to be autoposted on that day
  - the user can click on any one date and there will be a popup for the timings in the day
  - the user can adjust the time where the video is autoposted by dragging and dropping
  - time is displayed at the right side of the popup, when the user drags either up or down, the timebar will scroll in that direction
  - the user can drag and drop videos through their brief desciptions across dates as well
  - all of the algorithm optimized videos are pre scheduled, each with opitmal times
- a prompt to ask the user to connect the accounts if they have not

**reports**:
- analytics are shown:
  - views, retention rate, conversion rate, ROI etc over time
  - there should be a diversity of charts used, all of which should be appropriate for the metric
  - metrics should be combined across platforms
- the view must be uncluttered and be easy to navigate, each analytic chart should be in its own section
- actionable insights based on the analytics 

**template generator**:
- chatbot ai style ui
- the input box should prompt the user to type out the features of the product, attach some pictures if they have them
- the output boxes should be further separated into:
  - hook, script, visuals and audios reccomended
  - there should be 5 sets of these outputs for 1 prompt
  - leave ample empty space and make the template collapsible to prevent cluttering the view

**competitor tactics**:
- shows a colapsible list of the tactics the top 5 competitors use
- should link to the videos of competitors on the specific platform
- visual hierarcchy should be obvious
