import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

import icon from '../images/emoji.svg';
import styles from '../styles/Chat.module.css';
import Messages from './Messages';

const socket = io.connect('https://socket-server-nqu3.onrender.com');

const Chat = () => {
	const { search } = useLocation();
	const [params, setParams] = useState({ room: '', user: '' });
	const [state, setState] = useState([]);
	const [message, setMessage] = useState('');
	const [isOpen, setOpen] = useState(false);
	const [users, setUsers] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		const searchParams = Object.fromEntries(new URLSearchParams(search));
		setParams(searchParams);
		socket.emit('join', searchParams);
	}, [search]);

	useEffect(() => {
		socket.on('message', ({ data }) => {
			setState(_state => [..._state, data]);
		});
	}, []);

	useEffect(() => {
		socket.on('room', ({ data: { users } }) => {
			setUsers(users.length);
		});
	}, []);

	// console.log(state);

	const leftRoom = () => {
		socket.emit('leftRoom', { params });
		navigate('/');
	};

	const handleChange = ({ target: { value } }) => setMessage(value);

	const handleSubmit = e => {
		e.preventDefault();

		if (!message) return;

		// socket.emit('sendMessage', { message, params });
		socket.emit('sendMessage', { message, params });

		setMessage('');
	};

	const onEmojiclick = ({ emoji }) => setMessage(`${message} ${emoji}`);

	return (
		<div className={styles.wrap}>
			<div className={styles.header}>
				<div className={styles.title}>{params.room}</div>
				<div className={styles.users}>{users} users in this room</div>
				<button onClick={leftRoom} className={styles.left}>
					Left the room
				</button>
			</div>

			<div className={styles.messages}>
				<Messages messages={state} name={params.name} />
			</div>

			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.input}>
					<input
						type='text'
						name='message'
						placeholder='What do you want to say?'
						value={message}
						onChange={handleChange}
						autoComplete='off'
						required
					/>
				</div>
				<div className={styles.emoji}>
					<img src={icon} alt='' onClick={() => setOpen(!isOpen)}></img>
					{isOpen && (
						<div className={styles.emojies}>
							<EmojiPicker onEmojiClick={onEmojiclick}></EmojiPicker>
						</div>
					)}
				</div>
				<div className={styles.button}>
					<input type='submit' onSubmit={handleSubmit} value='Send a message'></input>
				</div>
			</form>
		</div>
	);
};

export default Chat;
