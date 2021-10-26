const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
const { urlencoded } = require('body-parser');

mongoose.connect("mongodb+srv://admin-leksyking:leksyking7@cluster0.3ssh9.mongodb.net/todolistDB")

const app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema)
const item1 = new Item({
    name: "New Todolist"
})
const item2 = new Item({
    name:"Add new item"
})
const item3 = new Item({
    name: "Delete item"
})
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)


app.get('/', (req, res) => { 
    Item.find({}, (err, foundItems) => {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err) => {
                if(err){
                    console.log(err);
                }else{
                    console.log("successfully added the arrays");
                }
            })
            res.redirect("/");
        }else{
            res.render("list", { listTitle: "Today", newListItems: foundItems}); 
        }      
   })    
});

app.get("/:customListName", (req,res) =>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, (err, foundList) =>{
        if(!err){
            if(!foundList){
                //create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/" + customListName)
            }else{
                //show existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items}); 
                }
        }
    })
});

app.post('/', (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list
    const item4 = new Item({
        name: itemName
    })
    if(listName === "Today"){
        item4.save();
        res.redirect("/")
    }else{
        List.findOne({name: listName}, (err, foundList) =>{
            foundList.items.push(item4);
            foundList.save()
            res.redirect("/" + listName)
        })
    }
});

app.post("/delete", (req,res) => {
    const checkedItemId= req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, (err) =>{
            if(!err){
                 console.log("Todo deleted successfully");
                 res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
})

app.listen(3000, () => {
    console.log('Starting App!'); 
});
 