import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

type user = { id: number; name: string; phone: string; email: string };
type course = {
	id: number;
	user_id: number;
	course_selection: string;
	course_name: string;
	semester: string;
	semester_fee: number;
};
type userCourse = { user: user; course: course[] };

const userListAPI =
	"https://gist.githubusercontent.com/JCGonzaga01/36a8af85464d998221c71ea3eaa57225/raw/6fe851e029ee98e9ec85ceb87433ed5ed0f06e36/users.json";
const userCourseListAPI =
	"https://gist.githubusercontent.com/JCGonzaga01/9c9e3590fb23274263678b6c4bcf9963/raw/600c8281f9db7eaba959a732912eba350bf7387d/user-course-selection.json";

function App() {
	const [userCourse, setUserCourse] = useState<userCourse[]>([]);
	const [FilteredUserCourse, setFilteredUserCourse] = useState<userCourse[]>([]);
	const [filter, setFilter] = useState("");

	useEffect(() => {
		// Retrieve user list
		axios
			.get(userListAPI)
			.then(resUser => {
				// Retrieve course list with corresponding registered user
				axios
					.get(userCourseListAPI)
					.then(resCourse => {
						let userSelectedCourse: userCourse[] = [];

						// Get all course of the user
						resUser.data.forEach((userData: user) => {
							// Filter the course that is registered for specific user
							const selectedCourse = resCourse.data.filter(
								(courseData: course) => courseData.user_id === userData.id
							);

							// Remove the duplication of the course
							const nonDuplocatedCourse: course[] = [];
							selectedCourse.forEach((course: course) => {
								if (
									!nonDuplocatedCourse.find(
										item =>
											item.course_name === course.course_name &&
											item.course_selection === course.course_selection &&
											item.semester === course.semester
									)
								)
									nonDuplocatedCourse.push(course);
							});
							userSelectedCourse.push({ user: userData, course: nonDuplocatedCourse });
						});

						setUserCourse(userSelectedCourse);
						setFilteredUserCourse(userSelectedCourse);
					})
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}, []);

	useEffect(() => {
		const updatedFilteredUserCourse = userCourse.filter(
			item =>
				item.user.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
				item.user.email.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
				item.user.phone.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
		);
		setFilteredUserCourse(updatedFilteredUserCourse);
	}, [filter]);

	return (
		<div>
			<input
				type="text"
				name="filter"
				id="filter"
				placeholder="User Filter"
				className="m-10"
				value={filter}
				onChange={e => setFilter(e.target.value)}
			/>
			{FilteredUserCourse.length > 0 ? (
				FilteredUserCourse.map((item, index) => (
					<div className="table-container" key={index}>
						<div className="table-section">
							<h5>
								{item.user.name} | {item.user.phone} | {item.user.email}
							</h5>
						</div>
						<div className="table-section">
							{item.course.length > 0 ? (
								item.course.map((course, index) => (
									<h5 key={index}>
										{course.course_selection} | {course.course_name} | {course.semester}
									</h5>
								))
							) : (
								<h5>No data found</h5>
							)}
						</div>
					</div>
				))
			) : (
				<div className="table-section">
					<h5>No user found</h5>
				</div>
			)}
		</div>
	);
}

export default App;
