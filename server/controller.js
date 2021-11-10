require('dotenv').config()
const Sequelize = require('sequelize');
const {CONNECTION_STRING} = process.env;
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl:{
            rejectUnauthorized: false
        }
    }
});

let nextEmp = 5

module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`SELECT cc_appointments.appt_id, cc_appointments.date, cc_appointments.service_type, cc_appointments.approved, cc_appointments.completed, cc_users.first_name, cc_users.last_name 
        FROM cc_appointments
        JOIN cc_emp_appts on cc_appointments.appt_id = cc_emp_appts.appt_id
        JOIN cc_employees on cc_employees.emp_id = cc_emp_appts.emp_id
        JOIN cc_users on cc_employees.user_id = cc_users.user_id
        WHERE cc_appointments.approved = true and cc_appointments.completed = false
        ORDER BY cc_appointments.date desc;`)
            .then((dbRes) => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`update cc_appointments set approved = true
        where appt_id = ${apptId};
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },

    getAllClients: (req, res) => {
        sequelize.query(`select * from cc_users u
        join cc_clients c on c.user_id = u.user_id;`)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch((err) => console.log(err))
    },

    getPendingAppointments: (req,res) => {
        sequelize.query(`select *
        from cc_appointments a
        where a.approved = false
        order by a.date desc;`)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch((err) => console.log(err))
    },

    getPastAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.notes, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = true
        order by a.date desc;`)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch((err) => console.log(err))
    },
    completeAppointment: (req, res) => {
        let {apptId} = req.body
        sequelize.query(`update cc_appointments a
        set completed = true
        where appt_id = ${apptId}`)
        .then((dbRes) => res.status(200).send(dbRes[0]))
        .catch((err) => console.log(err))
    }


}
