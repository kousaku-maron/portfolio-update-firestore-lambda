import * as admin from 'firebase-admin'
import axios from 'axios'

let serviceAccount
if(process.env.stage === 'prod') {
  serviceAccount = require('./config/serviceAccountKeyProd.json')
}
else {
  serviceAccount = require('./config/serviceAccountKeyDev.json')
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export const hello = async (event, context, callback) => {
  const db = admin.firestore()
  const collection = db.collection(process.env.collection)

  const docs = []
  await collection.get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      docs.push(doc.data().id)
    })
  })
  .catch(error => callback(error))

  const res = await axios({
    method: 'get',
    url: process.env.endpoint,
  })

  let deleteDocs = docs
  if(res.data) {
    Promise.all(res.data.map(async element => {
      const record = {
        id: element.id,
        name: element.name,
        full_name: element.full_name,
        html_url: element.html_url,
        description: element.description,
        created_at: element.created_at,
        updated_at: element.updated_at,
        language: element.language,
        stargazers_count: element.stargazers_count,
        watchers_count: element.watchers_count,
      }

      const filtered = deleteDocs.filter((doc) => {
        return doc !== element.id 
      })

      deleteDocs = filtered

      await collection.doc(element.id.toString()).set(record)
        .then(() => console.log(`add ${element.id} record.`))
        .catch(error => callback(error))
    }))
  }

  if(deleteDocs.length !== 0) {
    Promise.all(deleteDocs.map(async id => {
      await collection.doc(id).delete()
      .then(() => console.log(`delete ${element.id} record.`))
      .catch(error => callback(error))
    }))
  }

  callback(null, {
    message: `update ${process.env.collection} success.`,
    event,
  })
}
