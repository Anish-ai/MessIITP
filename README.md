# MessIITP

MessIITP is a comprehensive mobile application designed to enhance the mess system at our college. This app provides a user-friendly interface for students, mess secretaries, and administrators to interact with and manage the college mess system efficiently.

## Features

### User Interface
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing in any lighting condition.
- **Time-based Menu Display**: Automatically shows the current meal menu based on the time of day.
- **Next Meal Preview**: Displays the upcoming meal menu outside of regular meal hours.

### User Roles and Permissions
- **Normal Users**: Can view menus, rate meals, and provide feedback.
- **Mess Secretaries**: Additional privileges to modify menus for their respective messes.
- **Administrators**: Full access to system settings and menu modifications for all messes.

### Menu Management
- **Dynamic Menu Updates**: Menus are updated in real-time as changes are made by authorized users.
- **Meal Categories**: Separate menus for breakfast, lunch, snacks, and dinner.

### Rating System
- **Daily Meal Ratings**: Users can rate each meal (breakfast, lunch, snacks, dinner) individually.
- **Feedback Submission**: Option to provide daily feedback on meals.
- **Rating Display**: Shows today's average rating and overall average rating alongside each meal menu.

### Analytics and Comparisons
- **Rating Trends**: Line graph displaying rating trends of the current meal over the past few days for all messes.
- **Mess Comparison**: Color-coded lines in the graph for easy comparison between different messes.
- **Quality Leaderboard**: Displays a ranking of messes based on food quality ratings.

### Notifications
- **Meal Reminders**: Sends notifications with the meal menu 5 minutes before each meal time.

## Technology Stack

- **Frontend**: [Your chosen frontend framework/library]
- **Backend**: [Your chosen backend framework]
- **Database**: MySQL
- **Authentication**: [Your chosen auth method]

## Database Structure

The app utilizes a MySQL database to store and manage data efficiently. The database includes tables for:

- Users (with role information)
- Messes
- Menus
- Ratings
- Feedback

Relationships between these tables are implemented using SQL to ensure data integrity and efficient querying.


## Usage

1. **Normal Users**:
- Log in to view daily menus.
- Rate meals and provide feedback.
- Check rating trends and mess rankings.
2. **Mess Secretaries**:
- Log in with mess secretary credentials.
- Access the menu modification page for their assigned mess.
- Update menus and view feedback for their mess.
3. **Administrators**:
- Log in with admin credentials.
- Access system-wide settings.
- Modify menus for all messes.
- View comprehensive analytics and reports.

## Contributing

We welcome contributions to MessIITP! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/MessIITP](https://github.com/yourusername/MessIITP)

## Acknowledgements

- *Tech Used: *React Native, Expo, JWT, MySQL, Node.js, Render
