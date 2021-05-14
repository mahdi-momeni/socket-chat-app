const socket = io()
/*
socket.on('countUpdated', function functionOcuuredWhenEventEmited(value) {
    console.log(`count is ${value}`);
})

document.getElementById('counter').addEventListener('click', function () {
    socket.emit('increment')
})*/

// Elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = document.getElementById('message')
const $messageFormButton = document.getElementById('submit')
const $sendLocationButton = document.getElementById("sendLocation")
const $messages = document.getElementById("messages")
const $sidebar = document.getElementById("sidebar")


// templates
const messageTemplate = document.getElementById("message-template").innerHTML
const locationTemplate = document.getElementById("location-template").innerHTML
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML

// options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

function autoScroll() {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', function (value) {
    console.log(value);
    const html = Mustache.render(messageTemplate, {
        username: value.username,
        message: value.text,
        createdAt: moment(value.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', function (value) {
    console.log(value);
    const html = Mustache.render(locationTemplate, {
        username: value.username,
        url: value.url,
        createdAt: moment(value.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

$messageForm.addEventListener('submit', function (e) {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', "disabled")
    //disable
    const messageText = e.target.elements.message.value
    socket.emit("sendMessage", messageText, function (error) {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            console.log(error);
        } else {
            console.log('message was deliverd!');
        }
    })
})

$sendLocationButton.addEventListener("click", function () {
    $sendLocationButton.setAttribute('disabled', "disabled")
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('sendLocation', {lat: position.coords.latitude, lng: position.coords.longitude}, function (value) {
            $sendLocationButton.removeAttribute('disabled')
            console.log(value);
        })
    }, function (error) {
        $sendLocationButton.removeAttribute('disabled')
        console.log(error);
    })
})

socket.emit("join", {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        window.location.href = '/'
    }
})

socket.on("roomData", ({users, room}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})