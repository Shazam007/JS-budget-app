
// budget controller module
var budgetController = (function(){

    //data structure as an object

    var data = {

        allItems : {
            inc : [],
            exp : []
        },
        total : {
            inc : 0,
            exp : 0
        },
        budget : 0,
        percentage : -1

    };



    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id,description,value){
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
    };

    Expense.prototype.CalculatePercentage = function(totalIncome){

        if(totalIncome > 0){
        this.percentage = Math.round(( this.value/totalIncome ) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var calculator = function(type){

        var sum=0;
        
        data.allItems[type].forEach(function(curElement){


            sum += curElement.value;


        });

        data.total[type] = sum;

    };

    //GIVE PUBLIC METHOD TO CREATE OBJECT
    return{

            //add item public method
            addItem : function(type,des,val){

            var id,newItem;
            //generate new ID
            if(data.allItems[type].length > 0){
            
                 id = data.allItems[type][data.allItems[type].length-1].id + 1;
            
            }else{
                id = 0; 
            }
           //check type
            if(type === 'exp'){
                var newItem = new Expense(id,des,val);
            }else if(type === 'inc'){
                var newItem = new Income(id,des,val);
            }

            //add the object to array
            data.allItems[type].push(newItem);
    
            return newItem;
    
            },

            deleteItem : function(type,id){

                var idArray;

                console.log('inside in thedelete item');

            	idArray = data.allItems[type].map(function(current){

            	    return current.id;

                });
                
                itemIndex = idArray.indexOf(id);

                if(itemIndex !== -1){
                data.allItems[type].splice(itemIndex, 1);
                console.log('deleted' + itemIndex);
                }

            },

            calculateBudget: function(){

                //1) calculate total income and total expenses
                calculator('inc');
                calculator('exp');

                //2) calculate budget inc- exp
                data.budget = data.total.inc - data.total.exp;

                //3)generate percentage
                if(data.total.inc>0){
                    data.percentage = Math.round( (data.total.exp/data.total.inc)*100 );
                }else{
                    data.percentage = -1;
                }
                
            },

            CalcPercentage : function(){

                data.allItems.exp.forEach(function(cur){

                    cur.CalculatePercentage(data.total.inc);

                });

            },

            getItemPercentage : function(){

                var percentageList;

                percentageList = data.allItems.exp.map(function (cur){

                    return cur.percentage;

                });

                return percentageList;

            },

            getBudget : function(){

                return{

                    budget : data.budget,
                    income : data.total.inc,
                    expense : data.total.exp,
                    percentage : data.percentage
                }

            }



    }


})(); //end of budget controller









// UI contoller module
var UIcontroller = (function(){

    var DOMstrings = {

        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeListSection : '.income__list',
        expenseListSection : '.expenses__list',
        budget__value: '.budget__value',
        budget__incomeValue: '.budget__income--value',
        budget__expensesValue: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container : '.container',
        itemPercentages : '.item__percentage',
        timeLable : '.budget__title--month'

    };

    var numberFormat = function(num, type){

        //turn into decimal

        num = Math.abs(num);

        num = num.toFixed(2);

        // part into decimal and 10th

        numArray = num.split('.');

        whole = numArray[0];

        dec = numArray[1];

        //add comma

        if(whole.length>3){

            num = whole.substr(0,whole.length-3) + ',' + whole.substr(whole.length-3,3);

        }

        type === 'inc' ? type = '+' : type = '-';

        return type + ' ' +num + '.' + dec;

    };

    var nodeListForEach = function(Nodelist, callbackFun){

        for(var i=0; i<Nodelist.length; i++){
            callbackFun(Nodelist[i],i);
        }


    };

    return {

        getFieldDatas : function(){

            return{

            type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)

            }

        },

        //list UI updating function 
        addItemList : function(obj,type){

            var html,newHtml,element;

            //1) get the html text as string

            if(type==='inc'){
                element = DOMstrings.incomeListSection;
           
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
           
            }else{
                element = DOMstrings.expenseListSection;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">12%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
           
            }
            //2)change placeholders

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',numberFormat(obj.value,type));
            //newHtml = newHtml.replace('%percentage%','34%');

            //3)manupilate DOM using adjacentHTML method

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },

        deleteListItem : function(SelectorID){

            var el = document.getElementById(SelectorID);

            el.parentNode.removeChild(el);

        },

        updatePercetangeList : function(percentage){

            var nodesList = document.querySelectorAll(DOMstrings.itemPercentages);

            nodeListForEach(nodesList, function(current, index){

                if(percentage[index]>0){
                current.textContent = percentage[index] + '%';
                }else{
                    current.textContent ='---';
                }

            });


        },

        clearFields : function(){
            var domList, listArray;

            domList = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            listArray = Array.prototype.slice.call(domList);

            listArray.forEach(function(current,index,array){

                current.value = "";

            });


            listArray[0].focus();   //change the cursor position


        },

        displayBudget : function(obj){

           // console.log(obj);

           var type;

           obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budget__value).textContent = numberFormat(obj.budget,type);
            document.querySelector(DOMstrings.budget__incomeValue).textContent = numberFormat(obj.income,'inc');
            document.querySelector(DOMstrings.budget__expensesValue).textContent = numberFormat(obj.expense,'exp');
            


            if(obj.percentage > 0){
                document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.budgetPercentage).textContent = '---';
            }


        },

        displayDate : function(){
            

            var now = new Date(); 

            document.querySelector(DOMstrings.timeLable).textContent = now.getFullYear();

        },

        changedType : function(){

            var fileds = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

                nodeListForEach(fileds, function(cur){

                    cur.classList.toggle('red-focus');

                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            

        },

        getDOMstring : function(){

            return DOMstrings;

        }


    }


})();







//app controller module
var appController = (function(budgetCtrl,UICtrl){

    var DOM = UICtrl.getDOMstring();

    //event listners
    var eventListner = function(){

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddEvent);

        document.addEventListener('keypress', function(event){

        

        if(event.keyCode === 13 || event.which === 13){

            ctrlAddEvent();

        }

         });

        document.querySelector(DOM.container).addEventListener('click', ctrldeleteEvent);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    };




    //calculate budget common function
    var calculateBudget = function(){

        //calculate bufget
        budgetCtrl.calculateBudget();
        //get the budget
        var budgetObject = budgetCtrl.getBudget();
        //update Budget UI
        UICtrl.displayBudget(budgetObject);

    }

    var updatePercentages = function(){

        // calculate the percentage

        budgetCtrl.CalcPercentage();

        // get the percentage

        var percentageArray = budgetCtrl.getItemPercentage();
        console.log(percentageArray);

        //set ui percentage

        UICtrl.updatePercetangeList(percentageArray);

    }

    //everything controlling function
    var ctrlAddEvent = function(){

        //variables
        var addedData, addedItem;

        //get data from textbox
        addedData = UICtrl.getFieldDatas();


        //check values and validate
        if(addedData.value > 0 && addedData.description !=="" && !(isNaN(addedData.value))){

            //add data to the data controller
            addedItem = budgetCtrl.addItem(addedData.type,addedData.description,addedData.value);
            

            //update UI
            UICtrl.addItemList(addedItem,addedData.type);

            //clear fields
            UICtrl.clearFields();

            //calculate budget
            calculateBudget();

            //calculateListPercentage
            updatePercentages();

        }
            
        


    };

    var ctrldeleteEvent =function(event){
        var itemID,itemIDarray,type,id;

        //get the item id of target element to an array 
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

        itemIDarray = itemID.split('-');

        //console.log(itemIDarray);

        type = itemIDarray[0];
        id = parseInt(itemIDarray[1]);

        //remove event from data
        budgetCtrl.deleteItem(type,id);
        //remove event from ui
        UICtrl.deleteListItem(itemID);
        //calculate budget again
        calculateBudget();

        //calculateListPercentage
        updatePercentages();
       
        }
    };




    //give init to public

    return {

        init : function(){

            console.log('Application started!');
            UICtrl.displayDate();
            UICtrl.displayBudget({

                budget : 0,
                income : 0,
                expense : 0,
                percentage : 0
            });
            eventListner();

        }


    };
    
    


})(budgetController,UIcontroller);

appController.init();
