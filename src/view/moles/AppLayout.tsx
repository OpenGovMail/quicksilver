import { Box } from "@mui/material";
import React from "react";
import Header from "./Header";

const AppLayout = ({
	children,
	title = "",
	titleIcon = null,
	showSearch = false,
	onSearch = null,
	actions = [],
}) => {
	return (
		<Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
			{/* Main Content Area */}
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				{/* Mobile/Desktop Header */}
				<Header
					title={title}
					titleIcon={titleIcon}
					showBack={false}
					showSearch={showSearch}
					onSearch={onSearch}
					actions={actions}
				/>

				{/* Page Content */}
				<Box
					component="main"
					sx={{
						flex: 1,
						overflow: "auto",
						backgroundColor: "background.default",
					}}
				>
					{children}
				</Box>
			</Box>
		</Box>
	);
};

export default AppLayout;
