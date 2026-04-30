const pool = require('../db/pool');

module.exports.create = async (user_id, event_id) => {
    const query = `
    INSERT INTO rsvps (user_id, event_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING rsvp_id, user_id, event_id
    `;
    const { rows } = await pool.query(query, [user_id, event_id]);
    return rows[0] || null;
};

module.exports.destroy = async (user_id, event_id) => {
    const query = `
    DELETE FROM rsvps
    WHERE user_id = $1 AND event_id = $2
    RETURNING rsvp_id, user_id, event_id
    `;
    const { rows } = await pool.query(query, [user_id, event_id]);
    return rows[0] || null;
};

module.exports.listByUser = async (user_id) => {
    const query = `
    SELECT events.event_id, events.title, events.description, events.date, events.location, events.event_type, events.max_capacity, events.user_id,
    users.username,
    COUNT(r2.rsvp_id) AS rsvp_count
    FROM rsvps
    JOIN events ON rsvps.event_id = events.event_id
    JOIN users ON events.user_id = users.user_id
    LEFT JOIN rsvps r2 ON events.event_id = r2.event_id
    WHERE rsvps.user_id = $1
    GROUP BY events.event_id, users.username
    ORDER BY events.date ASC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
};