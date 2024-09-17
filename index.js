import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { getdate } from './date.js';
import mongoose from "mongoose";
import { name } from "ejs";
import _ from "lodash";
// import * as helper from './date.js';// chatgpt
// console.log(getdate.day);
const day = getdate(); //very important
// console.log(daye);

// const items = [" Buy Food", " Cook Food", " Eat Food"];
const workItems = [];
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const __dirname = dirname(fileURLToPath(
    import.meta.url)); //https://www.geeksforgeeks.org/node-js-url-fileurltopath-api/


let conn = await mongoose.connect("mongodb://localhost:27017/todoListDB");
const itemsSchema = new mongoose.Schema({
    name: String,
});
const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome To your todolist"
})
const item2 = new Item({
    name: "Hit the + button to add a new line."
})
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});
const defualtItems = [item1, item2, item3];


const ListSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = new mongoose.model("List", ListSchema);
// Item.insertMany(defualtItems)



// import ejs from ejs;


// app.use("view engine", "ejs");



let b = await Item.find({})
    // console.log(b.count);
    // b.forEach(element => {
    //     console.log(element.name)
    // });
app.get("/", async(req, res) => {
    // res.send("hEYYY");

    let founditems = await Item.find({})
    if (founditems.length === 0) {
        Item.insertMany(defualtItems);
        // founditems.forEach(element => {
        //     console.log(element.name)
        // });

        res.render("/");
    }
    // console.log(b.count);
    else {
        res.render("index.ejs", {

            listTittle: "Today",
            newListItems: founditems
        });

    }

});


app.get("/:customListName", async(req, res) => {
    // console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName)

    const findee = await List.findOne({ name: customListName });
    // console.log(findee);
    if (!findee) {
        // console.log("Doesn't Exist");

        //create a new list
        const list = new List({
            name: customListName,
            items: defualtItems,
        });
        list.save();
        res.redirect("/" + customListName);

    } else {
        // console.log(" Exist");
        res.render("index.ejs", {
            listTittle: findee.name,
            newListItems: findee.items
        })

    }

})



app.post("/", async(req, res) => {
    const itemName = req.body.newItem;
    const listname = req.body.list;


    const item = new Item({
        name: itemName
    })

    if (listname === "Today") {
        item.save();
        res.redirect("/");
    } else {
        const foundList = await List.findOne({ name: listname });
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listname)
    }



});

app.post("/delete", async(req, res) => {
    const checkeditemid = req.body.checkbox;
    const listname = req.body.listName;

    // Check if checkeditemid is present  
    if (!checkeditemid) {
        return res.status(400).send("Item ID is required");
    }

    const taskId = new mongoose.Types.ObjectId(checkeditemid);

    try {
        if (listname === "Today") {
            await Item.findByIdAndDelete(checkeditemid);
            res.redirect("/");
        } else {
            await List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: taskId } } });
            res.redirect("/" + listname);
        }
    } catch (error) {
        console.error(error); // Log the error for debugging  
        res.status(500).send("Internal server error");
    }
});


app.post("/work", (req, res) => {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});
app.get("/about", (req, res) => {
    res.render("about.ejs");
})
app.listen(port, () => {
    console.log("heyy , server is running on port " + port);
});