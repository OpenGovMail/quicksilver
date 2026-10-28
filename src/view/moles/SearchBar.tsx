import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputBase, Paper } from "@mui/material";
import React, { useState } from "react";

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
	const [value, setValue] = useState("");

	const handleChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
		if (onSearch) {
			onSearch(newValue);
		}
	};

	const handleClear = () => {
		setValue("");
		if (onSearch) {
			onSearch("");
		}
	};

	return (
		<Paper
			component="form"
			onSubmit={(e) => e.preventDefault()}
			elevation={0}
			sx={(theme) => ({
				px: 1.5,
				py: "3px",
				display: "flex",
				alignItems: "center",
				borderRadius: "8px",
				backgroundColor: "background.paper",
				border: 1,
				borderColor: "rgba(185, 202, 203, 0.5)", // outline-variant hairline
				transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
				...theme.applyStyles("dark", {
					backgroundColor: "rgba(255, 255, 255, 0.05)",
					borderColor: "rgba(255, 255, 255, 0.10)",
				}),
				"&:focus-within": {
					borderColor: "rgba(0, 242, 255, 0.5)",
					boxShadow: "0 0 0 3px rgba(0, 242, 255, 0.15)",
					...theme.applyStyles("dark", {
						backgroundColor: "rgba(255, 255, 255, 0.05)",
						borderColor: "rgba(0, 242, 255, 0.4)",
						boxShadow: "0 0 0 3px rgba(0, 242, 255, 0.12)",
					}),
				},
			})}
		>
			<SearchIcon
				sx={(theme) => ({
					color: "rgba(0, 105, 111, 0.6)",
					mr: 1,
					fontSize: 20,
					...theme.applyStyles("dark", { color: "rgba(0, 242, 255, 0.6)" }),
				})}
			/>
			<InputBase
				sx={{ flex: 1, fontSize: "0.9375rem" }}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				inputProps={{ "aria-label": placeholder }}
			/>
			{value && (
				<IconButton
					onClick={handleClear}
					aria-label="clear search"
					size="small"
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			)}
		</Paper>
	);
};

export default SearchBar;
